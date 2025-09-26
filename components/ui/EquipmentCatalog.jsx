import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Link, CircleDot, Circle, Layout, Hand, CupSoda, Zap, Shield, Activity } from 'lucide-react';

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

export function EquipmentCatalog({ isOpen, onClose, onSubmitRequest }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCatalogItems();
    }
  }, [isOpen]);

  const fetchCatalogItems = async () => {
    try {
      const response = await fetch('/api/catalog/list');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setSelectedSpecs({});
    setCustomAmount(item.price_tc?.toString() || '');
  };

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
      await onSubmitRequest({
        type: 'gear',
        label: `${selectedItem.title}${Object.keys(selectedSpecs).length ? ` (${Object.entries(selectedSpecs).map(([k,v]) => v).join(', ')})` : ''}`,
        amount_tc: parseFloat(customAmount),
        item_id: selectedItem.slug,
        specs: selectedSpecs
      });
      
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
            <h2 className="text-xl font-bold text-white">Equipment Catalog</h2>
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
                return (
                  <button
                    key={item.slug}
                    onClick={() => handleItemSelect(item)}
                    className="p-4 bg-surface-800 hover:bg-surface-750 rounded-xl border border-surface-700 hover:border-surface-600 transition-all group"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <IconComponent size={32} className="text-primary group-hover:text-primary-400" />
                      <div className="font-medium text-surface-100 text-sm">{item.title}</div>
                      {item.price_tc && (
                        <div className="text-xs text-surface-400">{item.price_tc} TC</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
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

              {renderSpecs()}

              <div>
                <h4 className="text-sm font-medium text-white mb-2">Amount (TC)</h4>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount in TC"
                  min="1"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!customAmount || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-all flex items-center justify-center space-x-2"
                >
                  {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}