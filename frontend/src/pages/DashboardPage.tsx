import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { transactionsAPI } from '../services/api';

export function DashboardPage() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await transactionsAPI.list();
        setTransactions(data || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTransactions();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Finance AI Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <p className="text-gray-400">Welcome back, {user?.email}</p>
          <p className="text-sm text-gray-500">Tenant: {user?.tenantId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-900 p-6 rounded-lg">
            <p className="text-gray-300">Total Income</p>
            <p className="text-3xl font-bold">$0.00</p>
          </div>
          <div className="bg-red-900 p-6 rounded-lg">
            <p className="text-gray-300">Total Expenses</p>
            <p className="text-3xl font-bold">$0.00</p>
          </div>
          <div className="bg-blue-900 p-6 rounded-lg">
            <p className="text-gray-300">Balance</p>
            <p className="text-3xl font-bold">$0.00</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-400">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx: any) => (
                    <tr key={tx.id} className="border-b border-gray-700">
                      <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-2">{tx.description}</td>
                      <td className="py-2">
                        <span className={tx.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2">${tx.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/transactions')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded"
          >
            View Transactions
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded"
          >
            Upload File
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
