import 'package:flutter/material.dart';
import '../models/reaction.dart';
import '../config/app_colors.dart';
import 'reaction_picker.dart';
import 'floating_reaction_animation.dart';

class TelegramReactionBar extends StatelessWidget {
  final ReactionCounts counts;
  final ReactionType? userReaction;
  final Function(ReactionType) onReactionTap;
  final VoidCallback? onRemoveReaction;
  final bool showFloatingAnimation;
  
  const TelegramReactionBar({
    super.key,
    required this.counts,
    this.userReaction,
    required this.onReactionTap,
    this.onRemoveReaction,
    this.showFloatingAnimation = true,
  });
  
  @override
  Widget build(BuildContext context) {
    // Get reactions that have counts > 0
    final activeReactions = _getActiveReactions();
    
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          // Existing reactions with counts (Telegram-style)
          if (activeReactions.isNotEmpty) ...[
            Expanded(
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: activeReactions.map((entry) {
                  final type = entry.key;
                  final count = entry.value;
                  final isUserReaction = type == userReaction;
                  
                  return _buildReactionChip(
                    type: type,
                    count: count,
                    isSelected: isUserReaction,
                    onTap: () => _handleReactionTap(context, type),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(width: 8),
          ],
          
          // Add reaction button (always visible)
          _buildAddReactionButton(context),
        ],
      ),
    );
  }
  
  List<MapEntry<ReactionType, int>> _getActiveReactions() {
    final reactions = <ReactionType, int>{
      ReactionType.like: counts.like,
      ReactionType.love: counts.love,
      ReactionType.wow: counts.wow,
      ReactionType.sad: counts.sad,
      ReactionType.angry: counts.angry,
    };
    
    // Filter out reactions with 0 count and sort by count (descending)
    return reactions.entries
        .where((e) => e.value > 0)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));
  }
  
  Widget _buildReactionChip({
    required ReactionType type,
    required int count,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.buttonGreenEnd.withOpacity(0.2)
              : AppColors.inputBackground.withOpacity(0.5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.buttonGreenEnd
                : AppColors.inputBorder.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              type.emoji,
              style: const TextStyle(fontSize: 18),
            ),
            const SizedBox(width: 6),
            Text(
              _formatCount(count),
              style: TextStyle(
                color: isSelected ? AppColors.buttonGreenEnd : Colors.white,
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAddReactionButton(BuildContext context) {
    return InkWell(
      onTap: () => _showReactionPicker(context),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.inputBackground.withOpacity(0.5),
          shape: BoxShape.circle,
          border: Border.all(
            color: AppColors.inputBorder.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: const Icon(
          Icons.add_reaction_outlined,
          color: Colors.white70,
          size: 20,
        ),
      ),
    );
  }
  
  void _handleReactionTap(BuildContext context, ReactionType type) {
    // Show floating animation
    if (showFloatingAnimation) {
      final overlay = FloatingReactionsOverlay.of(context);
      overlay?.showReaction(type);
    }
    
    // If user taps their own reaction, remove it
    if (type == userReaction && onRemoveReaction != null) {
      onRemoveReaction!();
    } else {
      // Otherwise add/change reaction
      onReactionTap(type);
    }
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
  
  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }
}
