'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from '@/components/ui/card';
import { X, Smile } from 'lucide-react';
import { useTranslation } from '../../lib/i18n-hooks';
import { Features } from '../../lib/feature-flags';
import { ReactionGlyph, REACTION_TYPE_EMOJI } from '../ReactionIcons';

const REACTION_STICKERS = [
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'flex', emoji: '💪', label: 'Flex' },
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'lol', emoji: '😅', label: 'LOL' },
  { type: 'go', emoji: '⚡', label: 'Go!' },
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'thinking', emoji: '🤔', label: 'Hmm' }
];

export function ReactionsPanel({ 
  isOpen, 
  onClose, 
  targetUser, 
  tribeId, 
  currentUser,
  onReactionSent 
}) {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [recentReactions, setRecentReactions] = useState([]);

  useEffect(() => {
    if (isOpen && targetUser && Features.REACTIONS) {
      loadRecentReactions();
    }
  }, [isOpen, targetUser]);

  const loadRecentReactions = async () => {
    try {
      const response = await fetch(
        `/api/reactions?tribe_id=${tribeId}&to_user=${targetUser.id}&limit=5`
      );
      const data = await response.json();
      if (data.success) {
        setRecentReactions(data.reactions || []);
      }
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  const handleSendReaction = async (reactionType) => {
    if (sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribe_id: tribeId,
          from_user: currentUser?.id,
          to_user: targetUser.id,
          type: reactionType,
          meta: {
            trigger: 'skip_event',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        // Add to recent reactions
        const newReaction = {
          type: reactionType,
          emoji: REACTION_STICKERS.find(r => r.type === reactionType)?.emoji,
          from_user_name: currentUser?.name || 'You',
          created_at: new Date().toISOString()
        };
        
        setRecentReactions(prev => [newReaction, ...prev.slice(0, 4)]);
        
        if (onReactionSent) {
          onReactionSent(newReaction);
        }

        // Show success feedback
        const reactionEmoji = REACTION_STICKERS.find(r => r.type === reactionType)?.emoji;
        alert(`${reactionEmoji} Reaction sent to ${targetUser.name}!`);
        
        // Auto-close after sending
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        alert('Failed to send reaction');
      }
    } catch (error) {
      console.error('Failed to send reaction:', error);
      alert('Failed to send reaction');
    }
    setSending(false);
  };

  if (!Features.REACTIONS || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Smile size={20} className="text-accent" />
              <h3 className="text-lg font-bold text-surface-50">
                {t('send_reaction')}
              </h3>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Target User */}
          {targetUser && (
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-bold text-lg">
                  {targetUser.name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="text-surface-300 text-sm">
                Send a reaction to {targetUser.name}
              </div>
            </div>
          )}

          {/* Reaction Stickers Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {REACTION_STICKERS.map((reaction) => (
              <Button
                key={reaction.type}
                onClick={() => handleSendReaction(reaction.type)}
                variant="ghost"
                className="h-16 flex-col space-y-1 hover:bg-surface-700 transition-colors"
                disabled={sending}
              >
                <ReactionGlyph emoji={reaction.emoji} size={24} />
                <span className="text-xs text-surface-400">{reaction.label}</span>
              </Button>
            ))}
          </div>

          {/* Recent Reactions */}
          {recentReactions.length > 0 && (
            <div className="border-t border-surface-700 pt-4">
              <div className="text-surface-400 text-xs uppercase tracking-wide mb-3">
                Recent Reactions
              </div>
              <div className="space-y-2">
                {recentReactions.slice(0, 3).map((reaction, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <ReactionGlyph emoji={reaction.emoji} size={18} />
                    <span className="text-surface-300">
                      {reaction.from_user_name}
                    </span>
                    <span className="text-surface-500 text-xs">
                      {new Date(reaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6">
            <div className="text-surface-500 text-xs">
              Reactions are playful and supportive!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper component for displaying reactions in feeds
export function ReactionDisplay({ reactions = [], compact = false }) {
  if (!Features.REACTIONS || !reactions.length) {
    return null;
  }

  // Group reactions by type
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.type]) {
      acc[reaction.type] = [];
    }
    acc[reaction.type].push(reaction);
    return acc;
  }, {});

  if (compact) {
    // Show just the emojis with counts
    return (
      <div className="flex items-center space-x-1">
        {Object.entries(groupedReactions).map(([type, reactionList]) => {
          const sticker = REACTION_STICKERS.find(s => s.type === type);
          return (
            <div 
              key={type}
              className="bg-surface-800 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
            >
              <ReactionGlyph emoji={sticker?.emoji} size={14} />
              <span className="text-surface-400">{reactionList.length}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Full display with names
  return (
    <div className="space-y-2">
      {Object.entries(groupedReactions).map(([type, reactionList]) => {
        const sticker = REACTION_STICKERS.find(s => s.type === type);
        return (
          <div key={type} className="flex items-center space-x-2">
            <ReactionGlyph emoji={sticker?.emoji} size={18} />
            <div className="flex-1">
              <span className="text-surface-300 text-sm">
                {reactionList.map(r => r.from_user_name).join(', ')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}