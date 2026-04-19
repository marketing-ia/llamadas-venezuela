import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { AnalyticsSummary, OperatorStats, DailyStat } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: 8 },
  labelStyle: { color: '#F9FAFB' },
};
const AXIS_TICK = { fill: '#9CA3AF', fontSize: 12 };
const GRID = { strokeDasharray: '3 3', stroke: '#374151' };

function monthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  return { startDate: first, endDate: today };
}

function last30Days() {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  return { startDate: start, endDate: end };
}

export function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [operatorStats, setOperatorStats] = useState<OperatorStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.getAnalyticsSummary(monthRange()),
      apiClient.getAnalyticsOperators(last30Days()),
      apiClient.getAnalyticsDailyStats(last30Days()),
    ])
      .then(([s, o, d]) => {
        setSummary(s);
        setOperatorStats(o.stats ?? []);
        setDailyStats(d.dailyStats ?? []);
      })
      .catch((err: any) => setError(err.error ?? 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout currentPage="analytics">
        <div className="text-center text-gray-400 py-16">Loading analytics…</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="analytics">
        <div className="text-red-400 bg-red-900/20 p-4 rounded">{error}</div>
      </Layout>
    );
  }

  const lineData = dailyStats.map((d) => ({
    date: d.date.slice(5),
    calls: parseInt(d.callCount, 10) || 0,
    cost: parseFloat(d.totalCost) || 0,
  }));

  const barData = operatorStats.map((o) => ({
    name: o['Operator.name'] ?? o.operator_id.slice(0, 8),
    calls: parseInt(o.callCount, 10) || 0,
    cost: parseFloat(o.totalCost) || 0,
  }));

  const noData = operatorStats.length === 0 && dailyStats.length === 0;

  return (
    <Layout currentPage="analytics">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Analytics</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Month-to-Date Cost</p>
            <p className="text-3xl font-bold text-white">
              ${Number(summary?.totalCost ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Total Calls (Month)</p>
            <p className="text-3xl font-bold text-white">{summary?.totalCalls ?? 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Total Minutes (Month)</p>
            <p className="text-3xl font-bold text-white">
              {Math.round(Number(summary?.totalDuration ?? 0) / 60)}
            </p>
          </div>
        </div>

        {noData ? (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <p className="text-gray-400">No analytics data available yet.</p>
          </div>
        ) : (
          <>
            {/* Line Chart: Calls Per Day */}
            {lineData.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Calls Per Day — Last 30 Days
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={lineData}>
                    <CartesianGrid {...GRID} />
                    <XAxis dataKey="date" tick={AXIS_TICK} />
                    <YAxis tick={AXIS_TICK} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} itemStyle={{ color: '#60A5FA' }} />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart: Calls by Operator */}
            {barData.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Calls by Operator — Last 30 Days
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData}>
                    <CartesianGrid {...GRID} />
                    <XAxis dataKey="name" tick={AXIS_TICK} />
                    <YAxis tick={AXIS_TICK} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} itemStyle={{ color: '#34D399' }} />
                    <Bar dataKey="calls" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Operator Table */}
            {operatorStats.length > 0 && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white">Operator Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-300">Operator</th>
                        <th className="px-6 py-3 text-right text-gray-300">Calls</th>
                        <th className="px-6 py-3 text-right text-gray-300">Minutes</th>
                        <th className="px-6 py-3 text-right text-gray-300">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operatorStats.map((op) => (
                        <tr key={op.operator_id} className="border-b border-slate-700">
                          <td className="px-6 py-4 text-gray-300">
                            {op['Operator.name'] ?? op.operator_id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-300">{op.callCount}</td>
                          <td className="px-6 py-4 text-right text-gray-300">
                            {Math.round(parseInt(op.totalDuration, 10) / 60)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-300">
                            ${parseFloat(op.totalCost).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
