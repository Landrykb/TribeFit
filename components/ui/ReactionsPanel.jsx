'use client';
import React, { useState, useEffect } from 'react';
import { useApi, optimisticMutate } from '../../lib/api';
import { Button } from './button';
import { Card } from '@/components/ui/card';
import { Skeleton } from './skeleton';
import { X, Smile } from 'lucide-react';
import { useTranslation } from '../../lib/i18n-hooks';
import { Features } from '../../lib/feature-flags';
import { REACTION_TYPES, ReactionGlyph, getReactionMeta } from '../ReactionTypes';

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

  const reactionsUrl = isOpen && targetUser && Features.REACTIONS
    ? `/api/reactions?tribe_id=${encodeURIComponent(tribeId)}&to_user=${encodeURIComponent(targetUser.id)}&limit=5`
    : null;
  const { data: reactionsData, loading: reactionsLoading } = useApi(reactionsUrl);

  useEffect(() => {
    if (reactionsData?.success) setRecentReactions(reactionsData.reactions || []);
  }, [reactionsData]);

  const handleSendReaction = async (reactionType) => {
    if (sending || !targetUser) return;
    setSending(true);

    const meta = getReactionMeta(reactionType);
    const newReaction = {
      type: reactionType,
      from_user: currentUser?.id,
      to_user: targetUser.id,
      from_user_name: currentUser?.name || 'You',
      to_user_name: targetUser.name,
      created_at: new Date().toISOString()
    };

    try {
      const promise = fetch('/api/reactions', {
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
      }).then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send reaction');
        return json;
      });

      await optimisticMutate(reactionsUrl, (current) => {
        if (!current) return current;
        const list = current.reactions || [];
        return { ...current, reactions: [newReaction, ...list.slice(0, 4)] };
      }, promise);

      setRecentReactions(prev => [newReaction, ...prev.slice(0, 4)]);
      onReactionSent?.(newReaction);
      setTimeout(() => onClose(), 600);
    } catch (error) {
      console.error('Failed to send reaction:', error);
      onClose?.();
    }
    setSending(false);
  };

  if (!Features.REACTIONS || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Smile size={20} className="text-accent" />
              <h3 className="text-lg font-bold text-surface-50">
                {t('send_reaction')}
              </h3>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X size={16} />
            </Button>
          </div>

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

          <div className="grid grid-cols-4 gap-3 mb-6">
            {REACTION_TYPES.map((reaction) => (
              <Button
                key={reaction.type}
                onClick={() => handleSendReaction(reaction.type)}
                variant="ghost"
                className="h-16 flex-col space-y-1 hover:bg-surface-700 transition-colors"
                disabled={sending}
              >
                <ReactionGlyph type={reaction.type} size={24} />
                <span className="text-xs text-surface-400">{reaction.label}</span>
              </Button>
            ))}
          </div>

          {reactionsLoading ? (
            <div className="border-t border-surface-700 pt-4 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : recentReactions.length > 0 && (
            <div className="border-t border-surface-700 pt-4">
              <div className="text-surface-400 text-xs uppercase tracking-wide mb-3">
                Recent
              </div>
              <div className="space-y-2">
                {recentReactions.slice(0, 5).map((reaction, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm">
                    <ReactionGlyph type={reaction.type} size={18} />
                    <span className="text-surface-300">
                      {reaction.from_user_name} → {reaction.to_user_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
