import { useEffect, useState } from 'react';
import api from '../services/api';

export function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/budgets');
        setBudgets(data || []);
      } catch (err) {
        console.error('Failed to fetch budgets:', err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Orçamentos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => (
          <div key={b.id} className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">{b.category}</h3>
            <p className="text-gray-400">Limite: R${b.limit.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{b.period}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
