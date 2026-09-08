import React, { useMemo, useState } from 'react';
import { X, Coins } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const FX_RATES = {
  USD: 1,     // 1 USD -> 1 TC
  EUR: 1.08,  // approx -> 1 EUR ~ 1.08 USD
  JPY: 0.0067 // approx -> 1 JPY ~ 0.0067 USD
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function StripeCheckoutInner({ clientSecret, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== 'undefined' ? window.location.href : undefined,
        }
      });
      if (error) {
        alert(error.message || 'Payment failed');
      } else {
        // If no immediate error, Stripe may redirect or complete
        alert('Payment submitted. Your wallet will update shortly.');
        onClose();
      }
    } catch (e) {
      alert('Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handleConfirm}
        disabled={!stripe || submitting}
        className="w-full bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-surface-600 disabled:to-surface-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 font-bold shadow-lg hover:shadow-primary/25"
      >
        {submitting ? 'Processing…' : 'Confirm Payment'}
      </button>
    </div>
  );
}

export function TopUpModal({ isOpen, onClose, onCreateCheckout, defaultCurrency = 'USD' }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const estimatedTc = useMemo(() => {
    const amt = parseFloat(amount || '0');
    if (Number.isNaN(amt) || amt <= 0) return 0;
    const usd = currency in FX_RATES ? amt * FX_RATES[currency] : amt;
    return Math.max(0, Math.floor(usd)); // 1 TC ~= 1 USD
  }, [amount, currency]);

  const handleProceed = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      if (onCreateCheckout) {
        const data = await onCreateCheckout({ amount: parseFloat(amount), currency, estimatedTc });
        if (data && data.client_secret) {
          setClientSecret(data.client_secret);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 light:bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-900 light:bg-white light:border-gray-200 border border-surface-700 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6 border-b border-surface-700 light:border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Top Up Wallet</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-700 light:hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X size={20} className="text-surface-300 hover:text-surface-100 light:text-gray-500 light:hover:text-gray-700" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-surface-100 light:text-gray-800 mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 focus:ring-2 focus:ring-primary focus:border-primary light:bg-white light:border-gray-300 light:text-gray-900"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-100 light:text-gray-800 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-full p-3 bg-surface-700 border border-surface-600 rounded-xl text-surface-50 placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-primary light:bg-white light:border-gray-300 light:text-gray-900"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 text-surface-200">
              <Coins size={18} className="text-primary" />
              <div className="text-sm">
                Estimated credit: <span className="font-bold text-primary">{estimatedTc} TC</span>
              </div>
            </div>
            <div className="text-[11px] text-surface-400 mt-2">
              1 TC ≈ $1 USD. Your card will be charged in the selected currency. Final TC amount is credited after payment and FX conversion.
            </div>
          </div>

          {clientSecret && stripePromise ? (
            <div className="space-y-3 pt-2">
              <div className="text-sm text-surface-300">Complete payment securely:</div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutInner clientSecret={clientSecret} onClose={onClose} />
              </Elements>
            </div>
          ) : (
            <div className="flex space-x-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-surface-700 border border-surface-600 hover:bg-surface-600 hover:border-surface-500 text-surface-100 rounded-xl px-4 py-3 transition-all duration-200 font-medium light:bg-white light:border-gray-300 light:text-gray-700 light:hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                disabled={!amount || parseFloat(amount) <= 0 || loading}
                className="flex-1 bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-surface-600 disabled:to-surface-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-primary/25"
              >
                {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                <span>Proceed to Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
