'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from '@/components/ui/card';
import { 
  Plus, ShoppingCart, Target, Users, Crown, 
  Package, Zap, Gift, TrendingUp, Check, X
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n-hooks';
import { Features } from '../../lib/feature-flags';

export function WishlistManager({ tribeId, user, onBuyWithBalance }) {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tribeId && Features.WISHLIST) {
      loadWishlist();
      loadCatalog();
    }
  }, [tribeId]);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist?tribe_id=${tribeId}`);
      const data = await response.json();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const loadCatalog = async () => {
    try {
      const response = await fetch('/api/catalog');
      const data = await response.json();
      if (data.success) {
        setCatalogItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load catalog:', error);
    }
  };

  const handleAddToWishlist = async (catalogItem, specs = {}, targetTc = null) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribe_id: tribeId,
          catalog_item_id: catalogItem.id,
          specs,
          target_tc: targetTc || catalogItem.price_tc,
          user_id: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadWishlist();
        setShowAddModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
    setLoading(false);
  };

  const handlePledge = async (wishlistItemId, amount) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishlist/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wishlist_item_id: wishlistItemId,
          pledge_amount: parseFloat(amount),
          user_id: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadWishlist();
        // Update user balance locally
        if (onBuyWithBalance) {
          onBuyWithBalance(-parseFloat(amount));
        }
      }
    } catch (error) {
      console.error('Failed to pledge:', error);
    }
    setLoading(false);
  };

  const handleDirectBuy = async (catalogItem, specs = {}) => {
    const confirmBuy = window.confirm(
      `Buy ${catalogItem.name} for ${catalogItem.price_tc} TC using your balance?`
    );
    
    if (!confirmBuy) return;

    setLoading(true);
    try {
      const response = await fetch('/api/catalog/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          catalog_item_id: catalogItem.id,
          specs,
          price_tc: catalogItem.price_tc,
          tribe_id: tribeId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update user balance
        if (onBuyWithBalance) {
          onBuyWithBalance(-catalogItem.price_tc);
        }
        alert(`✅ Successfully purchased ${catalogItem.name}!`);
      } else {
        alert(`❌ Purchase failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to buy item:', error);
      alert('❌ Purchase failed');
    }
    setLoading(false);
  };

  if (!Features.WISHLIST) {
    return null;
  }

  const wishlistItems = wishlist?.wishlist_items || [];

  return (
    <div className="space-y-6">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift size={20} className="text-accent" />
          <h3 className="text-lg font-bold text-surface-50">{t('wishlist')}</h3>
          <span className="text-surface-400 text-sm">
            ({wishlistItems.length} items)
          </span>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="ghost"
          size="sm"
          className="px-3 py-2 flex items-center gap-1"
        >
          <Plus size={16} />
          <span className="text-xs">Add</span>
        </Button>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlistItems.map((item) => {
            const progressPct = (item.pledged_tc / item.target_tc) * 100;
            const isReady = item.pledged_tc >= item.target_tc;
            
            return (
              <Card key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-surface-50">{item.label}</h4>
                    <div className="text-surface-400 text-sm">
                      {item.catalog_items?.category || 'equipment'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-accent">{item.target_tc} TC</div>
                    <div className="text-xs text-surface-400">target</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Progress</span>
                    <span className="text-surface-300">
                      {item.pledged_tc}/{item.target_tc} TC ({Math.round(progressPct)}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isReady ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(progressPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Specs (if any) */}
                {item.specs && Object.keys(item.specs).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(item.specs).map(([key, value]) => (
                      <span 
                        key={key}
                        className="bg-surface-700 text-surface-300 px-2 py-1 rounded text-xs"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {isReady ? (
                    <Button
                      onClick={() => {
                        if (item.catalog_items) {
                          handleDirectBuy(item.catalog_items, item.specs);
                        }
                      }}
                      variant="success"
                      className="flex-1 text-sm"
                      disabled={loading}
                    >
                      <Check size={16} />
                      <span>Purchase Now</span>
                    </Button>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="TC"
                        className="flex-1 bg-surface-800 border border-surface-600 rounded px-3 py-2 text-sm"
                        value={pledgeAmount}
                        onChange={(e) => setPledgeAmount(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          if (pledgeAmount) {
                            handlePledge(item.id, pledgeAmount);
                            setPledgeAmount('');
                          }
                        }}
                        variant="primary"
                        className="text-sm"
                        disabled={loading || !pledgeAmount}
                      >
                        <Target size={16} />
                        {t('pledge')}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 card">
          <Gift size={48} className="text-surface-600 mx-auto mb-4" />
          <div className="text-surface-400 mb-4">No wishlist items yet</div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="px-4 py-2 flex items-center gap-2"
          >
            <Plus size={16} />
            Add First Item
          </Button>
        </div>
      )}

      {/* Add to Wishlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-surface-50">Catalog</h3>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catalogItems.map((item) => (
                  <Card key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-surface-50">{item.name}</h4>
                        <div className="text-surface-400 text-sm">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{item.price_tc} TC</div>
                      </div>
                    </div>

                    <p className="text-surface-300 text-sm">{item.description}</p>

                    {/* Specs Selection */}
                    {item.specs && Object.keys(item.specs).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(item.specs).map(([key, options]) => (
                          <div key={key}>
                            <label className="text-xs text-surface-400 uppercase tracking-wide">
                              {key}
                            </label>
                            <select className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1 text-sm">
                              {Array.isArray(options) ? options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              )) : (
                                <option value={options}>{options}</option>
                              )}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleDirectBuy(item)}
                        variant="success"
                        className="flex-1 text-sm"
                        disabled={loading}
                      >
                        <ShoppingCart size={16} />
                        {t('buy_with_balance')}
                      </Button>
                      <Button
                        onClick={() => handleAddToWishlist(item)}
                        variant="ghost"
                        className="flex-1 text-sm"
                        disabled={loading}
                      >
                        <Plus size={16} />
                        {t('add_to_wishlist')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}