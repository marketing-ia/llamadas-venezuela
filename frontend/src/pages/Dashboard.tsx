import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { ActiveCalls } from '../components/ActiveCalls';
import { apiClient } from '../services/api';
import { AnalyticsSummary, Operator } from '../types';

function todayRange() {
  const d = new Date().toISOString().slice(0, 10);
  return { startDate: d, endDate: d };
}

function monthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  return { startDate: first, endDate: today };
}

export function Dashboard() {
  const [todaySummary, setTodaySummary] = useState<AnalyticsSummary | null>(null);
  const [monthSummary, setMonthSummary] = useState<AnalyticsSummary | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  const [operatorId, setOperatorId] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [calling, setCalling] = useState(false);
  const [callMsg, setCallMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const [t, m] = await Promise.all([
        apiClient.getAnalyticsSummary(todayRange()),
        apiClient.getAnalyticsSummary(monthRange()),
      ]);
      setTodaySummary(t);
      setMonthSummary(m);
    } catch {
      // ignore refresh errors silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    apiClient.getOperators()
      .then((data) => setOperators(data.operators ?? []))
      .catch(() => {});
    const id = setInterval(fetchMetrics, 30000);
    return () => clearInterval(id);
  }, [fetchMetrics]);

  const handleInitiateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalling(true);
    setCallMsg(null);
    try {
      const result = await apiClient.initiateCall(operatorId, toNumber);
      setCallMsg({ type: 'success', text: `Call initiated — SID: ${result.callSid}` });
      setToNumber('');
    } catch (err: any) {
      setCallMsg({ type: 'error', text: err.error ?? 'Failed to initiate call' });
    } finally {
      setCalling(false);
    }
  };

  const dash = (value: React.ReactNode) =>
    loading ? <span className="text-gray-500">—</span> : value;

  const todayCalls = Number(todaySummary?.totalCalls ?? 0);
  const todayMinutes = Math.round(Number(todaySummary?.totalDuration ?? 0) / 60);
  const todayCost = Number(todaySummary?.totalCost ?? 0);
  const monthCost = Number(monthSummary?.totalCost ?? 0);

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          {loading && <span className="text-gray-500 text-sm">Loading…</span>}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Today's Calls</p>
            <p className="text-3xl font-bold text-white">{dash(todayCalls)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Today's Minutes</p>
            <p className="text-3xl font-bold text-white">{dash(todayMinutes)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Today's Cost</p>
            <p className="text-3xl font-bold text-white">{dash(`$${todayCost.toFixed(2)}`)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Month Cost</p>
            <p className="text-3xl font-bold text-white">{dash(`$${monthCost.toFixed(2)}`)}</p>
          </div>
        </div>

        {/* Make a Call */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Make a Call</h3>
          <form onSubmit={handleInitiateCall} className="flex flex-col sm:flex-row gap-3">
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              required
              className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Operator…</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.twilio_number})
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={toNumber}
              onChange={(e) => setToNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={calling || !operatorId || !toNumber}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {calling ? 'Calling…' : 'Initiate Call'}
            </button>
          </form>
          {callMsg && (
            <p className={`mt-3 text-sm ${callMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {callMsg.text}
            </p>
          )}
        </div>

        {/* Active Calls Monitor */}
        <ActiveCalls />
      </div>
    </Layout>
  );
}
