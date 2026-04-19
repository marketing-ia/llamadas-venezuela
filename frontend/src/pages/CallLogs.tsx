import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { CallRecord } from '../types';
import { useStore } from '../store';

export function CallLogs() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const { setError: setStoreError } = useStore();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getCallLogs({ limit, offset });
        setCalls(data.calls);
        setTotal(data.total);
      } catch (err: any) {
        const errorMsg = err.error || 'Failed to load call logs';
        setError(errorMsg);
        setStoreError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [limit, offset, setStoreError]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const statusColors = {
    initiated: 'bg-blue-500/20 text-blue-300',
    ringing: 'bg-yellow-500/20 text-yellow-300',
    answered: 'bg-green-500/20 text-green-300',
    completed: 'bg-green-600/20 text-green-200',
    failed: 'bg-red-500/20 text-red-300',
  };

  if (loading) {
    return (
      <Layout currentPage="calls">
        <div className="text-center text-gray-400">Loading call logs...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="calls">
        <div className="text-red-400 bg-red-900/20 p-4 rounded">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="calls">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Call Logs</h2>

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
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call.id} className="border-b border-slate-700 hover:bg-slate-750">
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(call.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {call.Operator?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{call.from_number}</td>
                      <td className="px-6 py-4 text-gray-300">{call.to_number}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {Math.floor(call.duration_seconds / 60)}m{' '}
                        {call.duration_seconds % 60}s
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        ${call.total_cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[call.status as keyof typeof statusColors]
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
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Listen
                          </a>
                        ) : (
                          <span className="text-gray-600">-</span>
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
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} calls
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded transition-colors"
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
