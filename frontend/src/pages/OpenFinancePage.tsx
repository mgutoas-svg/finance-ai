import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openFinanceAPI } from '../services/api';

export function OpenFinancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data } = await openFinanceAPI.getAuthUrl();
      setAuthUrl(data.authUrl);
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Open Finance</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Back
          </button>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="text-5xl">🏦</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Bank Account</h2>
              <p className="text-gray-400">
                Securely sync your bank accounts and transactions in real-time using Open Finance (Bacen).
              </p>
            </div>
          </div>

          <div className="bg-green-900 bg-opacity-30 border border-green-700 p-4 rounded mb-8">
            <p className="text-green-200">
              ✓ Security: Bank-grade encryption
              ✓ Privacy: Your credentials never reach our servers
              ✓ Speed: Real-time synchronization
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-semibold mb-4"
          >
            {loading ? 'Connecting...' : connected ? '✓ Connected' : 'Connect Bank Account'}
          </button>

          <div className="text-sm text-gray-400 text-center">
            You'll be redirected to your bank's secure portal to authorize access.
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Supported Banks</h3>
            <p className="text-sm text-gray-400">
              All Brazilian banks participate in the Open Finance ecosystem, including:
              Banco do Brasil, Caixa, Itaú, Bradesco, Santander, Nubank, and others.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">What You Can Access</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>✓ Account balances and details</li>
              <li>✓ Transaction history (up to 12 months)</li>
              <li>✓ Real-time synchronization</li>
              <li>✓ Multiple accounts support</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Security</h3>
            <p className="text-sm text-gray-400">
              We use bank-standard security protocols. Your credentials are only shared with your bank,
              never stored on our servers. You can revoke access anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
