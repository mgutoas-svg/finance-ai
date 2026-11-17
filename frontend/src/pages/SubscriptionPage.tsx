import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../services/api';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      features: ['Unlimited transactions', 'Basic dashboard', 'Manual uploads'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$9',
      period: '/month',
      features: [
        'Everything in Free',
        'PDF & OFX imports',
        'Email support',
        'Up to 10 accounts',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: [
        'Everything in Basic',
        'Open Finance integration',
        'Advanced analytics',
        'API access',
        'Priority support',
        'Unlimited accounts',
      ],
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const { data } = await paymentsAPI.checkout(planId);
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-gray-400">Scale your finances with Finance AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg border ${
                plan.id === 'pro'
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="mb-2">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-400">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading}
                className={`w-full py-2 rounded font-semibold disabled:opacity-50 ${
                  plan.id === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {loading ? 'Loading...' : plan.id === 'free' ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">FAQ</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-1">Can I change plans anytime?</p>
              <p className="text-gray-400 text-sm">Yes, upgrade or downgrade anytime. Changes take effect immediately.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Do you offer refunds?</p>
              <p className="text-gray-400 text-sm">30-day money-back guarantee on annual plans.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">What about data security?</p>
              <p className="text-gray-400 text-sm">AES-256 encryption, LGPD compliant, PCI-DSS certified.</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
