import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../services/api';
import { CallRecord } from '../types';

const STATUS_LABELS: Record<string, string> = {
  initiated: 'Conectando',
  ringing: 'Timbrando',
  answered: 'En llamada',
};

const STATUS_COLORS: Record<string, string> = {
  initiated: 'bg-blue-500/20 text-blue-300',
  ringing: 'bg-yellow-500/20 text-yellow-300',
  answered: 'bg-green-500/20 text-green-300',
};

// Calls stuck in 'initiated' for more than 10 minutes are considered stale
const STALE_THRESHOLD_MS = 10 * 60 * 1000;

function isStale(call: CallRecord): boolean {
  const created = new Date(call.createdAt ?? call.started_at ?? 0).getTime();
  return call.status === 'initiated' && Date.now() - created > STALE_THRESHOLD_MS;
}

function LiveTimer({ startedAt }: { startedAt?: string }) {
  const [seconds, setSeconds] = useState(() =>
    startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0
  );

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return <span className="font-mono">{m}:{s}</span>;
}

export function ActiveCalls() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [ending, setEnding] = useState<Record<string, boolean>>({});

  const fetchActive = useCallback(async () => {
    const results = await Promise.allSettled([
      apiClient.getCallLogs({ status: 'initiated', limit: 10 }),
      apiClient.getCallLogs({ status: 'ringing', limit: 10 }),
      apiClient.getCallLogs({ status: 'answered', limit: 10 }),
    ]);
    const combined: CallRecord[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') combined.push(...(r.value.calls ?? []));
    }
    const seen = new Set<string>();
    // Filter out stale initiated calls from display
    setCalls(
      combined.filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return !isStale(c);
      })
    );
  }, []);

  useEffect(() => {
    fetchActive();
    const id = setInterval(fetchActive, 5000);
    return () => clearInterval(id);
  }, [fetchActive]);

  const handleEnd = async (call: CallRecord) => {
    setEnding((prev) => ({ ...prev, [call.id]: true }));
    try {
      await apiClient.endCall(call.twilio_call_sid);
      setCalls((prev) => prev.filter((c) => c.id !== call.id));
    } catch {
      // refetch will pick up real state
      await fetchActive();
    } finally {
      setEnding((prev) => ({ ...prev, [call.id]: false }));
    }
  };

  if (calls.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Llamadas activas</h3>
        <span className="flex items-center gap-2 text-sm text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {calls.length} activa{calls.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-gray-300">Operador</th>
              <th className="px-6 py-3 text-left text-gray-300">Desde</th>
              <th className="px-6 py-3 text-left text-gray-300">Hacia</th>
              <th className="px-6 py-3 text-left text-gray-300">Duración</th>
              <th className="px-6 py-3 text-left text-gray-300">Estado</th>
              <th className="px-6 py-3 text-left text-gray-300">Acción</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b border-slate-700">
                <td className="px-6 py-4 text-gray-300">{call.Operator?.name ?? 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-300">{call.from_number}</td>
                <td className="px-6 py-4 text-gray-300">{call.to_number}</td>
                <td className="px-6 py-4 text-gray-300">
                  <LiveTimer startedAt={call.started_at ?? call.createdAt} />
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[call.status] ?? ''}`}>
                    {STATUS_LABELS[call.status] ?? call.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEnd(call)}
                    disabled={ending[call.id]}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                  >
                    {ending[call.id] ? 'Colgando...' : 'Colgar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
