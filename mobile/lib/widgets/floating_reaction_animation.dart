import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../models/reaction.dart';

class FloatingReactionAnimation extends StatefulWidget {
  final ReactionType reactionType;
  final VoidCallback onComplete;
  
  const FloatingReactionAnimation({
    super.key,
    required this.reactionType,
    required this.onComplete,
  });
  
  @override
  State<FloatingReactionAnimation> createState() => _FloatingReactionAnimationState();
}

class _FloatingReactionAnimationState extends State<FloatingReactionAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _floatAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;
  late double _horizontalOffset;
  
  @override
  void initState() {
    super.initState();
    
    // Random horizontal offset for variety
    _horizontalOffset = (math.Random().nextDouble() - 0.5) * 100;
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    
    // Float up animation
    _floatAnimation = Tween<double>(
      begin: 0,
      end: -200,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
    
    // Scale animation (grow then shrink)
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.5)
            .chain(CurveTween(curve: Curves.elasticOut)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.5, end: 1.0),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0)
            .chain(CurveTween(curve: Curves.easeIn)),
        weight: 50,
      ),
    ]).animate(_controller);
    
    // Fade out animation
    _opacityAnimation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.5, 1.0, curve: Curves.easeIn),
    ));
    
    _controller.forward().then((_) => widget.onComplete());
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Positioned(
          bottom: 100 + _floatAnimation.value,
          left: MediaQuery.of(context).size.width / 2 - 25 + _horizontalOffset,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: Text(
                widget.reactionType.emoji,
                style: const TextStyle(fontSize: 50),
              ),
            ),
          ),
        );
      },
    );
  }
}

class FloatingReactionsOverlay extends StatefulWidget {
  final Widget child;
  
  const FloatingReactionsOverlay({
    super.key,
    required this.child,
  });
  
  static FloatingReactionsOverlayState? of(BuildContext context) {
    return context.findAncestorStateOfType<FloatingReactionsOverlayState>();
  }
  
  @override
  State<FloatingReactionsOverlay> createState() => FloatingReactionsOverlayState();
}

class FloatingReactionsOverlayState extends State<FloatingReactionsOverlay> {
  final List<Widget> _floatingReactions = [];
  int _reactionKey = 0;
  
  void showReaction(ReactionType reactionType) {
    final key = _reactionKey++;
    setState(() {
      _floatingReactions.add(
        FloatingReactionAnimation(
          key: ValueKey(key),
          reactionType: reactionType,
          onComplete: () {
            setState(() {
              _floatingReactions.removeWhere(
                (widget) => (widget.key as ValueKey).value == key,
              );
            });
          },
        ),
      );
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        ..._floatingReactions,
      ],
    );
  }
}
