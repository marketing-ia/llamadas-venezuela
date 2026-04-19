import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { CallRecord, Operator } from '../types';
import { useStore } from '../store';

const STATUS_COLORS: Record<string, string> = {
  initiated: 'bg-blue-500/20 text-blue-300',
  ringing: 'bg-yellow-500/20 text-yellow-300',
  answered: 'bg-green-500/20 text-green-300',
  completed: 'bg-green-600/20 text-green-200',
  failed: 'bg-red-500/20 text-red-300',
};

const STATUSES = ['initiated', 'ringing', 'answered', 'completed', 'failed'];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function CallLogs() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [filterOperatorId, setFilterOperatorId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const { setError: setStoreError } = useStore();

  useEffect(() => {
    apiClient.getOperators().then((data) => {
      setOperators(Array.isArray(data) ? data : data.operators ?? []);
    }).catch(() => {});
  }, []);

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCallLogs({
        limit,
        offset,
        operatorId: filterOperatorId || undefined,
        status: filterStatus || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      });
      setCalls(data.calls);
      setTotal(data.total);
    } catch (err: any) {
      const msg = err.error ?? 'Failed to load call logs';
      setError(msg);
      setStoreError(msg);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, filterOperatorId, filterStatus, filterStartDate, filterEndDate, setStoreError]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchCalls();
  };

  const handleClearFilters = () => {
    setFilterOperatorId('');
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
    setOffset(0);
  };

  const hasFilters = filterOperatorId || filterStatus || filterStartDate || filterEndDate;

  return (
    <Layout currentPage="calls">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Call Logs</h2>

        {/* Filters */}
        <form
          onSubmit={handleFilterSubmit}
          className="bg-slate-800 rounded-lg p-4 border border-slate-700"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Operator</label>
              <select
                value={filterOperatorId}
                onChange={(e) => setFilterOperatorId(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All operators</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">From date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
            >
              Apply Filters
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded transition-colors"
              >
                Clear
              </button>
            )}
            {loading && <span className="text-gray-500 text-sm ml-2">Loading…</span>}
          </div>
        </form>

        {error && (
          <div className="text-red-400 bg-red-900/20 p-4 rounded">{error}</div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300">Date & Time</th>
                  <th className="px-6 py-3 text-left text-gray-300">Operator</th>
                  <th className="px-6 py-3 text-left text-gray-300">From</th>
                  <th className="px-6 py-3 text-left text-gray-300">To</th>
                  <th className="px-6 py-3 text-left text-gray-300">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-300">Cost</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300">Recording</th>
                </tr>
              </thead>
              <tbody>
                {!loading && calls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call.id} className="border-b border-slate-700 hover:bg-slate-750">
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(call.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {call.Operator?.name ?? 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{call.from_number}</td>
                      <td className="px-6 py-4 text-gray-300">{call.to_number}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDuration(call.duration_seconds)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        ${call.total_cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[call.status] ?? 'bg-slate-600 text-gray-300'
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {call.recording_url ? (
                          <a
                            href={call.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                          >
                            ▶ Play
                          </a>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Showing {offset + 1}–{Math.min(offset + limit, total)} of {total} calls
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
