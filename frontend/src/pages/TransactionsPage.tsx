import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { transactionsAPI } from '../services/api';

export function TransactionsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await transactionsAPI.list(from, to);
        setTransactions(data || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTransactions();
  }, [user, from, to]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await transactionsAPI.delete(id);
        setTransactions(transactions.filter((t: any) => t.id !== id));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Transactions</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded"
              placeholder="From date"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded"
              placeholder="To date"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2">{tx.description}</td>
                    <td className="py-2">
                      <span className={tx.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2">${tx.amount.toFixed(2)}</td>
                    <td className="py-2 text-sm text-gray-400">{tx.source}</td>
                    <td className="py-2">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <p className="text-gray-400 text-center py-8">No transactions found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
