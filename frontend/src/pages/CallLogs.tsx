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
    initiated: 'bg-blue-100 text-blue-700',
    ringing: 'bg-yellow-100 text-yellow-700',
    answered: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <Layout currentPage="calls">
        <div className="text-center text-gray-500">Loading call logs...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="calls">
        <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="calls">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Call Logs</h2>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Date & Time</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Operator</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">From</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">To</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Cost</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-medium">Recording</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(call.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {call.Operator?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{call.from_number}</td>
                      <td className="px-6 py-4 text-gray-700">{call.to_number}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {Math.floor(call.duration_seconds / 60)}m{' '}
                        {call.duration_seconds % 60}s
                      </td>
                      <td className="px-6 py-4 text-gray-700">
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
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Listen
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} calls
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded transition-colors"
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
