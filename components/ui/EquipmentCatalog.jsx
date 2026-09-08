import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Link, CircleDot, Circle, Layout, Hand, CupSoda, Zap, Shield, Activity, ShoppingCart, Coins } from 'lucide-react';

// Icon mapping for catalog items
const CatalogIcon = {
  dumbbell: Dumbbell,
  barbell: Dumbbell, // Using dumbbell as fallback
  'circle-dot': CircleDot,
  link: Link,
  rope: Zap, // Using zap for rope
  circle: Circle,
  layout: Layout,
  hand: Hand,
  bottle: Activity, // Using activity for bottle
  'cup-soda': CupSoda
};

export function EquipmentCatalog({ isOpen, onClose, onSubmitRequest, onPurchase, availableSnatchedTc = 0, walletBalance = 0, highlightTitle, prefillAmount, autoSelectHighlight = false, wishlistTarget, wishlistCurrent }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [remainingMode, setRemainingMode] = useState(false);
  const mode = onPurchase ? 'purchase' : 'request';

  useEffect(() => {
    if (isOpen) {
      fetchCatalogItems();
    }
  }, [isOpen]);

  const fetchCatalogItems = async () => {
    try {
      const response = await fetch('/api/catalog');
      const data = await response.json();
      const raw = data.items || [];
      const mapped = raw.map((it) => ({
        ...it,
        title: it.title || it.name,
        slug: it.slug || it.id,
      }));
      setItems(mapped);
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setSelectedSpecs({});
    setQuantity(1);
    setRemainingMode(false);
    setCustomAmount(item.price_tc?.toString() || '');
  };

  // When items load, auto-select highlight and optionally prefill remaining
  useEffect(() => {
    if (!isOpen || !autoSelectHighlight || !highlightTitle || !items?.length) return;
    const match = items.find(it => it.title === highlightTitle);
    if (match) {
      setSelectedItem(match);
      setSelectedSpecs({});
      setQuantity(1);
      if (typeof prefillAmount === 'number' && prefillAmount > 0) {
        setRemainingMode(true);
        setCustomAmount(String(prefillAmount));
      } else {
        setRemainingMode(false);
        setCustomAmount(match.price_tc ? String(match.price_tc) : '');
      }
    }
  }, [isOpen, autoSelectHighlight, highlightTitle, items, prefillAmount]);

  // Keep total in sync when quantity changes (only if we are not in remaining mode and item has a price)
  useEffect(() => {
    if (!selectedItem) return;
    if (remainingMode) return;
    if (selectedItem.price_tc) {
      const total = (Number(selectedItem.price_tc) * Number(quantity || 1)) || 0;
      setCustomAmount(String(total));
    }
  }, [selectedItem, quantity, remainingMode]);

  const handleSpecSelect = (specType, value) => {
    setSelectedSpecs(prev => ({
      ...prev,
      [specType]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedItem || !customAmount) return;

    setLoading(true);
    try {
      const amount = parseFloat(customAmount);
      if (mode === 'purchase' && onPurchase) {
        const fromSnatched = Math.min(availableSnatchedTc, amount);
        const fromWallet = Math.max(0, amount - fromSnatched);
        await onPurchase({
          item: selectedItem,
          specs: selectedSpecs,
          amount_tc: amount,
          from_snatched: fromSnatched,
          from_wallet: fromWallet,
        });
      } else if (onSubmitRequest) {
        await onSubmitRequest({
          type: 'gear',
          label: `${selectedItem.title}${Object.keys(selectedSpecs).length ? ` (${Object.entries(selectedSpecs).map(([k,v]) => v).join(', ')})` : ''}`,
          amount_tc: amount,
          item_id: selectedItem.slug,
          specs: selectedSpecs
        });
      }
      
      // Reset and close
      setSelectedItem(null);
      setSelectedSpecs({});
      setCustomAmount('');
      onClose();
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSpecs = () => {
    if (!selectedItem?.specs) return null;

    return (
      <div className="space-y-3">
        {Object.entries(selectedItem.specs).map(([specType, options]) => (
          <div key={specType}>
            <h4 className="text-sm font-medium text-white mb-2 capitalize">{specType}</h4>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSpecSelect(specType, option)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedSpecs[specType] === option
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{mode === 'purchase' ? 'Marketplace' : 'Equipment Catalog'}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {!selectedItem ? (
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => {
                const IconComponent = CatalogIcon[item.icon] || Dumbbell;
                const isHighlighted = highlightTitle && item.title === highlightTitle;
                return (
                  <button
                    key={item.slug}
                    onClick={() => handleItemSelect(item)}
                    className={`p-4 bg-surface-800 hover:bg-surface-700 rounded-xl border transition-all group ${isHighlighted ? 'border-accent ring-2 ring-accent/40' : 'border-surface-700 hover:border-surface-600'}`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <IconComponent size={32} className="text-primary group-hover:text-primary-400" />
                      <div className="font-medium text-surface-100 text-sm">{item.title}</div>
                      {item.price_tc && (
                        <span className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 text-accent px-2 py-1 rounded-lg text-xs font-medium">{item.price_tc} TC</span>
                      )}
                      {isHighlighted && (
                        <div className="text-[10px] text-accent font-semibold bg-accent/10 border border-accent/30 rounded px-2 py-0.5">Snatched TCs available</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                  <div>
                    <h3 className="font-bold text-white">{selectedItem.title}</h3>
                    <p className="text-sm text-gray-400 capitalize">{selectedItem.category}</p>
                  </div>
                </div>
                {selectedItem.price_tc && (
                  <span className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 text-accent px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap">{selectedItem.price_tc} TC</span>
                )}
              </div>

              {renderSpecs()}

              <div>
                <h4 className="text-sm font-bold text-surface-100 mb-3 flex items-center gap-2">
                  <span className="text-accent">{mode === 'purchase' ? <ShoppingCart size={16} /> : <Coins size={16} />}</span>
                  {mode === 'purchase' ? 'Price / Amount (TC)' : 'Amount (TC)'}
                </h4>

                {selectedItem?.price_tc && !remainingMode && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs text-surface-300">Quantity</label>
                        <button
                          type="button"
                          onClick={() => {
                            const price = Number(selectedItem?.price_tc || 0);
                            if (price > 0) {
                              const maxQ = Math.floor(Number(availableSnatchedTc) / price);
                              setQuantity(Math.max(1, maxQ));
                            }
                          }}
                          className="text-[11px] text-primary underline underline-offset-4 hover:text-primary-300"
                        >
                          Max with Snatched
                        </button>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                        className="w-full p-3 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                      />
                      {Number(availableSnatchedTc) < Number(selectedItem?.price_tc || 0) && (
                        <div className="text-[11px] text-surface-400 mt-1">Not enough snatched to fully cover 1 unit. Wallet will cover the rest.</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-surface-300 mb-1">Total (TC)</label>
                      <input
                        type="number"
                        value={customAmount}
                        disabled
                        className="w-full p-3 bg-surface-800 border border-surface-600 rounded-xl text-surface-50"
                      />
                    </div>
                  </div>
                )}

                {(!selectedItem?.price_tc || remainingMode) && (
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full p-4 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    placeholder="Enter amount in TC"
                    min="1"
                  />
                )}

                {remainingMode && (
                  <div className="text-[11px] text-surface-300 mt-2">Paying remaining only to complete this goal.</div>
                )}
                {mode === 'purchase' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-success/10 border border-success/25 rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-success font-medium">Use Snatched</span>
                      <span className="text-success font-bold">{Math.min(availableSnatchedTc, parseFloat(customAmount) || 0)}</span>
                    </div>
                    <div className="bg-primary/10 border border-primary/25 rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-primary font-medium">From Wallet</span>
                      <span className="text-primary font-bold">{Math.max(0, (parseFloat(customAmount) || 0) - Math.min(availableSnatchedTc, parseFloat(customAmount) || 0))}</span>
                    </div>
                    <div className="col-span-2 text-[11px] text-surface-300">Snatched available: {availableSnatchedTc} • Wallet: {walletBalance}</div>
                  </div>
                )}

                {!!wishlistTarget && typeof wishlistCurrent === 'number' && (
                  <div className="mt-3 p-3 bg-surface-800 border border-surface-700 rounded-xl text-[12px] text-surface-300">
                    {(() => {
                      const amt = parseFloat(customAmount) || 0;
                      const newCur = Math.min(wishlistTarget, (wishlistCurrent || 0) + amt);
                      const pct = Math.round((newCur / wishlistTarget) * 100);
                      return (
                        <div className="flex items-center justify-between">
                          <span>After purchase:</span>
                          <span className="font-semibold text-surface-200">{newCur}/{wishlistTarget} TC ({pct}%)</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-surface-700 border border-surface-600 hover:bg-surface-600 hover:border-surface-500 text-surface-100 rounded-xl px-4 py-3 transition-all duration-200 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!customAmount || loading}
                  className="flex-1 bg-gradient-to-br from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:from-surface-600 disabled:to-surface-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-accent/25"
                >
                  {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{mode === 'purchase' ? 'Purchase Now' : 'Submit Request'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}