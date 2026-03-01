import 'package:flutter/material.dart';
import 'dart:async';
import '../models/reaction.dart';
import '../config/app_colors.dart';

class RecentReaction {
  final ReactionType type;
  final DateTime timestamp;
  
  RecentReaction({
    required this.type,
    required this.timestamp,
  });
}

class RecentReactionsDisplay extends StatefulWidget {
  final String contentId;
  final String contentType;
  
  const RecentReactionsDisplay({
    super.key,
    required this.contentId,
    required this.contentType,
  });
  
  @override
  State<RecentReactionsDisplay> createState() => RecentReactionsDisplayState();
}

class RecentReactionsDisplayState extends State<RecentReactionsDisplay>
    with SingleTickerProviderStateMixin {
  final List<RecentReaction> _recentReactions = [];
  Timer? _cleanupTimer;
  
  @override
  void initState() {
    super.initState();
    // Clean up old reactions every second
    _cleanupTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _cleanupOldReactions();
    });
  }
  
  @override
  void dispose() {
    _cleanupTimer?.cancel();
    super.dispose();
  }
  
  void addReaction(ReactionType type) {
    setState(() {
      _recentReactions.add(RecentReaction(
        type: type,
        timestamp: DateTime.now(),
      ));
      
      // Keep only last 10 reactions
      if (_recentReactions.length > 10) {
        _recentReactions.removeAt(0);
      }
    });
  }
  
  void _cleanupOldReactions() {
    final now = DateTime.now();
    setState(() {
      _recentReactions.removeWhere((reaction) {
        final age = now.difference(reaction.timestamp);
        return age.inSeconds > 5; // Remove reactions older than 5 seconds
      });
    });
  }
  
  @override
  Widget build(BuildContext context) {
    if (_recentReactions.isEmpty) {
      return const SizedBox.shrink();
    }
    
    // Group reactions by type and count
    final reactionCounts = <ReactionType, int>{};
    for (var reaction in _recentReactions) {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] ?? 0) + 1;
    }
    
    // Get top 3 recent reactions
    final topReactions = reactionCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final displayReactions = topReactions.take(3).toList();
    
    return AnimatedOpacity(
      opacity: _recentReactions.isNotEmpty ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 300),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.buttonGreenEnd.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.favorite,
              size: 14,
              color: AppColors.buttonGreenEnd,
            ),
            const SizedBox(width: 6),
            ...displayReactions.map((entry) {
              return Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      entry.key.emoji,
                      style: const TextStyle(fontSize: 16),
                    ),
                    if (entry.value > 1) ...[
                      const SizedBox(width: 2),
                      Text(
                        '${entry.value}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }),
            const SizedBox(width: 4),
            Text(
              'reacting now',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
