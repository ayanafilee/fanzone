import 'package:flutter/material.dart';
import '../models/reaction.dart';
import '../config/app_colors.dart';
import 'reaction_picker.dart';
import 'floating_reaction_animation.dart';

class ReactionBar extends StatelessWidget {
  final ReactionCounts counts;
  final ReactionType? userReaction;
  final Function(ReactionType) onReactionTap;
  final VoidCallback? onRemoveReaction;
  final bool isCompact;
  final bool showFloatingAnimation;
  
  const ReactionBar({
    super.key,
    required this.counts,
    this.userReaction,
    required this.onReactionTap,
    this.onRemoveReaction,
    this.isCompact = false,
    this.showFloatingAnimation = true,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 8 : 12,
        vertical: isCompact ? 6 : 8,
      ),
      decoration: BoxDecoration(
        color: AppColors.inputBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.inputBorder.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Main reaction button
          InkWell(
            onTap: () {
              if (userReaction != null && onRemoveReaction != null) {
                // Show picker to change reaction
                _showReactionPicker(context);
              } else {
                // Show picker to add reaction
                _showReactionPicker(context);
              }
            },
            onLongPress: () {
              _showReactionPicker(context);
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: isCompact ? 8 : 12,
                vertical: isCompact ? 4 : 6,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    userReaction?.emoji ?? '👍',
                    style: TextStyle(
                      fontSize: isCompact ? 16 : 20,
                    ),
                  ),
                  if (!isCompact) ...[
                    const SizedBox(width: 6),
                    Text(
                      userReaction?.label ?? 'Like',
                      style: TextStyle(
                        color: userReaction != null
                            ? AppColors.buttonGreenEnd
                            : Colors.white70,
                        fontSize: 14,
                        fontWeight: userReaction != null
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          
          if (counts.total > 0) ...[
            const SizedBox(width: 8),
            Container(
              width: 1,
              height: isCompact ? 16 : 20,
              color: AppColors.inputBorder.withOpacity(0.3),
            ),
            const SizedBox(width: 8),
            // Reaction counts
            InkWell(
              onTap: () {
                // Show detailed reaction breakdown
                _showReactionDetails(context);
              },
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: isCompact ? 4 : 8,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Show top 3 reactions
                    ..._getTopReactions().map((type) => Padding(
                      padding: const EdgeInsets.only(right: 2),
                      child: Text(
                        type.emoji,
                        style: TextStyle(
                          fontSize: isCompact ? 14 : 16,
                        ),
                      ),
                    )),
                    const SizedBox(width: 4),
                    Text(
                      _formatCount(counts.total),
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: isCompact ? 12 : 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
  
  List<ReactionType> _getTopReactions() {
    final reactions = <ReactionType, int>{
      ReactionType.like: counts.like,
      ReactionType.love: counts.love,
      ReactionType.wow: counts.wow,
      ReactionType.sad: counts.sad,
      ReactionType.angry: counts.angry,
    };
    
    final sorted = reactions.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    
    return sorted
        .where((e) => e.value > 0)
        .take(3)
        .map((e) => e.key)
        .toList();
  }
  
  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }
  
  void _showReactionPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => ReactionPicker(
        currentReaction: userReaction,
        onReactionSelected: (type) {
          Navigator.pop(context);
          
          // Show floating animation
          if (showFloatingAnimation) {
            final overlay = FloatingReactionsOverlay.of(context);
            overlay?.showReaction(type);
          }
          
          if (type == userReaction && onRemoveReaction != null) {
            onRemoveReaction!();
          } else {
            onReactionTap(type);
          }
        },
      ),
    );
  }
  
  void _showReactionDetails(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkGreen,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Reactions',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...ReactionType.values.map((type) {
              final count = counts.getCount(type);
              if (count == 0) return const SizedBox.shrink();
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Text(
                      type.emoji,
                      style: const TextStyle(fontSize: 24),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      type.label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      count.toString(),
                      style: const TextStyle(
                        color: AppColors.textGrey,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
