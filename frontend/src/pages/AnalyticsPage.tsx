import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [healthRes, metricsRes, categoriesRes] = await Promise.all([
          api.get('/analytics/health'),
          api.get('/analytics/metrics'),
          api.get('/analytics/categories'),
        ]);
        setHealth(healthRes.data);
        setMetrics(metricsRes.data);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getNPSColor = (nps: number) => {
    if (nps >= 75) return 'bg-green-900';
    if (nps >= 50) return 'bg-yellow-900';
    return 'bg-red-900';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Financial Health Analytics</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Back
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading analytics...</p>
        ) : (
          <>
            {/* Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Health Score</p>
                <p className={`text-5xl font-bold ${getHealthColor(health?.healthScore || 0)}`}>
                  {health?.healthScore.toFixed(0) || 0}
                </p>
                <p className="text-gray-500 text-sm mt-2">Out of 100</p>
              </div>

              <div className={`${getNPSColor(health?.nps || 0)} p-6 rounded-lg`}>
                <p className="text-gray-200 text-sm">Financial NPS</p>
                <p className="text-5xl font-bold">{health?.nps.toFixed(0) || 0}</p>
                <p className="text-gray-300 text-sm mt-2">Your satisfaction score</p>
              </div>

              <div className="bg-blue-900 p-6 rounded-lg">
                <p className="text-gray-200 text-sm">Emergency Fund</p>
                <p className="text-5xl font-bold">{health?.emergencyFundMonths.toFixed(1) || 0}</p>
                <p className="text-gray-300 text-sm mt-2">Months of expenses covered</p>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Monthly Income</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(metrics?.totalIncome || 0).toFixed(0)}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-400">
                  ${(metrics?.totalExpenses || 0).toFixed(0)}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(metrics?.savingsRate || 0).toFixed(1)}%
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Expense Ratio</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(metrics?.expenseRatio || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Expense Categories */}
            {categories.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">Expense Categories</h2>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-4">
                      <span className="w-32 text-sm">{cat.name}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-6">
                        <div
                          className="bg-blue-600 h-6 rounded-full"
                          style={{
                            width: `${Math.min(
                              (cat.value / Math.max(...categories.map((c) => c.value))) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-20 text-right">
                        ${cat.value.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {health?.recommendations && health.recommendations.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {health.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="bg-gray-700 p-3 rounded flex items-start gap-3">
                      <span className="text-xl">💡</span>
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
