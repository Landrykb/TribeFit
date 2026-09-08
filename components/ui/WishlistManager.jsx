'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from '@/components/ui/card';
import { 
  Plus, ShoppingCart, Target, Users, Crown, 
  Package, Zap, Gift, TrendingUp, Check, X, Heart
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n-hooks';
import { Features } from '../../lib/feature-flags';

export function WishlistManager({ tribeId, user, onBuyWithBalance }) {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);
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
      <div className="flex items-center justify-between p-6 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 border border-accent/20 rounded-2xl">
        <div className="flex items-center space-x-3">
          <Gift size={24} className="text-accent" />
          <h3 className="text-2xl font-bold text-surface-50">{t('wishlist')}</h3>
          <span className="bg-accent/20 text-accent px-3 py-1 rounded-xl text-sm font-medium">
            {wishlistItems.length} items
          </span>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="h-10 px-4 bg-gradient-to-br from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-accent/25 border-0 flex items-center gap-2 whitespace-nowrap min-w-[80px]"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add</span>
        </Button>
      </div>


      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlistItems.map((item) => {
            const progressPct = (item.pledged_tc / item.target_tc) * 100;
            const isReady = item.pledged_tc >= item.target_tc;
            
            return (
              <Card key={item.id} className="p-4 space-y-3 hover-elevate bg-surface-800 border-surface-600">
                {/* Compact Header */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg text-surface-50">{item.label}</h4>
                      <span className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 text-accent px-2 py-1 rounded-lg text-xs font-medium">
                        {item.target_tc} TC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-surface-400">Progress: {item.pledged_tc}/{item.target_tc} TC</span>
                    <span className="text-surface-300 font-medium">({Math.round(progressPct)}%)</span>
                  </div>
                  <div className="w-full bg-surface-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isReady ? 'bg-gradient-to-r from-success to-green-500' : 'bg-gradient-to-r from-primary to-primary-400'
                      }`}
                      style={{ width: `${Math.min(progressPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-3 pt-2">
                  {!isReady && (
                    <button
                      onClick={() => {
                        setSelectedWishlistItem(item);
                        setShowSpendModal(true);
                      }}
                      className="flex-1 p-2 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg hover:from-accent/20 hover:to-primary/20 hover:border-accent/30 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Target size={14} className="text-accent" />
                      <span className="text-sm font-semibold text-surface-100">Next Goal: +{item.target_tc - item.pledged_tc} TC</span>
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 flex items-center gap-2 text-sm font-medium">
                    <Heart size={14} className="text-danger" />
                    <span>Donate to Gym</span>
                  </button>
                </div>
                {/* Specs (if any) */}
                {item.specs && Object.keys(item.specs).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(item.specs).map(([key, value]) => (
                      <span 
                        key={key}
                        className="bg-surface-700 border border-surface-600 text-surface-200 px-2 py-1 rounded-lg text-xs font-medium"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex flex-col items-center">
            <Gift size={64} className="text-accent mb-4" />
            <h3 className="text-lg font-bold text-surface-100 mb-2">No wishlist items yet</h3>
            <p className="text-surface-300 mb-6 text-sm">Add equipment you'd like your tribe to fund!</p>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              className="h-12 px-6 text-sm font-bold bg-gradient-to-br from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-accent/25 flex items-center gap-2 whitespace-nowrap min-w-[140px]"
            >
              <Plus size={18} />
              Add First Item
            </Button>
          </div>
        </div>
      )}

      {/* Add to Wishlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-surface-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package size={24} className="text-accent" />
                  <h3 className="text-2xl font-bold text-surface-50">Equipment Catalog</h3>
                </div>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-surface-700 rounded-xl transition-all duration-200"
                >
                  <X size={20} className="text-surface-300 hover:text-surface-100" />
                </Button>
              </div>
              <p className="text-surface-300 mt-2">Choose equipment to add to your tribe's wishlist</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogItems.map((item) => (
                  <div key={item.id} className="bg-surface-800 border border-surface-600 rounded-2xl p-5 space-y-4 hover-elevate transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-surface-50 group-hover:text-accent transition-colors">{item.name}</h4>
                        <div className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-xl text-sm font-medium inline-block mt-2">
                          {item.category}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl px-3 py-2">
                          <div className="font-bold text-lg text-primary">{item.price_tc} TC</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-surface-300 text-sm leading-relaxed">{item.description}</p>
                    
                    <div className="pt-2 border-t border-surface-700">
                      <Button
                        onClick={() => {
                          // Add to wishlist logic here
                          setShowAddModal(false);
                        }}
                        variant="primary"
                        className="w-full h-11 bg-gradient-to-br from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-accent/25 border-0 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Plus size={16} />
                        <span className="font-bold text-sm">Add to Wishlist</span>
                      </Button>
                    </div>

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

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spend on Next Gear Modal */}
      {showSpendModal && selectedWishlistItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-surface-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target size={24} className="text-accent" />
                  <h3 className="text-2xl font-bold text-surface-50">Next Gear</h3>
                </div>
                <Button
                  onClick={() => setShowSpendModal(false)}
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-surface-700 rounded-xl"
                >
                  <X size={20} className="text-surface-300" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Info */}
              <div className="text-center">
                <h4 className="text-2xl font-bold text-surface-50 mb-2">{selectedWishlistItem.label}</h4>
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-xl text-sm font-medium inline-block">
                  {selectedWishlistItem.catalog_items?.category || 'equipment'}
                </div>
              </div>

              {/* Target and Progress */}
              <div className="bg-surface-800 rounded-xl p-4 border border-surface-700 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400 font-medium">Target</span>
                  <div className="text-accent font-bold text-2xl">{selectedWishlistItem.target_tc} TC</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Progress</span>
                    <span className="text-surface-300">
                      {selectedWishlistItem.pledged_tc}/{selectedWishlistItem.target_tc} TC ({Math.round((selectedWishlistItem.pledged_tc / selectedWishlistItem.target_tc) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-700 rounded-full h-4 shadow-inner">
                    <div 
                      className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary-400 shadow-primary/25"
                      style={{ width: `${Math.min((selectedWishlistItem.pledged_tc / selectedWishlistItem.target_tc) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-xl">
                  <div className="text-surface-100 font-bold text-sm mb-1">Next Goal</div>
                  <div className="text-accent font-bold text-2xl">
                    +{selectedWishlistItem.target_tc - selectedWishlistItem.pledged_tc} TC
                  </div>
                  <div className="text-surface-300 text-sm">needed to unlock</div>
                </div>
              </div>

              {/* Pledge Input */}
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder="Enter TC amount"
                    className="flex-1 bg-surface-700 border border-surface-600 rounded-xl px-4 py-3 text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (pledgeAmount && selectedWishlistItem) {
                        handlePledge(selectedWishlistItem.id, pledgeAmount);
                        setPledgeAmount('');
                        setShowSpendModal(false);
                      }
                    }}
                    variant="primary"
                    className="min-w-[100px] bg-gradient-to-br from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700"
                    disabled={loading || !pledgeAmount}
                  >
                    <Target size={16} />
                    Pledge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}