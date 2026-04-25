import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { ActiveCalls } from '../components/ActiveCalls';
import { apiClient } from '../services/api';
import { AnalyticsSummary, Operator } from '../types';
import { useVoiceContext } from '../context/VoiceDeviceContext';

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

  const { deviceState, activeCall, startCall, hangUp } = useVoiceContext();

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

  function normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    // Venezuelan local mobile: 04XX -> +584XX
    if (/^04\d{9}$/.test(digits)) return '+58' + digits.slice(1);
    // Venezuelan local landline: 02XX -> +582XX
    if (/^02\d{9}$/.test(digits)) return '+58' + digits.slice(1);
    // Already has country code without +
    if (/^58\d{10}$/.test(digits)) return '+' + digits;
    // Return as-is if starts with + (E.164) or unknown
    return raw.trim();
  }

  const handleInitiateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceState !== 'registered') {
      setCallMsg({ type: 'error', text: 'Dispositivo de voz no conectado. Espera unos segundos e intenta de nuevo.' });
      return;
    }
    const normalized = normalizePhone(toNumber);
    if (!/^\+[1-9]\d{6,14}$/.test(normalized)) {
      setCallMsg({ type: 'error', text: `Número inválido: "${toNumber}". Usa formato +58XXXXXXXXXX o 04XXXXXXXXX.` });
      return;
    }
    setCalling(true);
    setCallMsg(null);
    try {
      const call = await startCall(normalized);
      setCallMsg({ type: 'success', text: 'Conectando...' });
      setToNumber('');
      call.on('ringing', () => setCallMsg({ type: 'success', text: 'Repicando en destino...' }));
      call.on('accept', () => setCallMsg({ type: 'success', text: 'Llamada en curso' }));
      call.on('disconnect', () => setCallMsg(null));
    } catch (err: any) {
      setCallMsg({ type: 'error', text: err.message ?? 'Error al iniciar la llamada' });
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Hacer Llamada</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              deviceState === 'registered' ? 'bg-green-900/60 text-green-400' :
              deviceState === 'registering' ? 'bg-yellow-900/60 text-yellow-400' :
              'bg-red-900/60 text-red-400'
            }`}>
              {deviceState === 'registered' ? 'Audio listo' :
               deviceState === 'registering' ? 'Conectando...' : 'Sin audio'}
            </span>
          </div>

          {activeCall ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-300 font-medium">Llamada en curso</span>
              </div>
              <button
                onClick={hangUp}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors"
              >
                Colgar
              </button>
            </div>
          ) : (
            <form onSubmit={handleInitiateCall} className="flex flex-col sm:flex-row gap-3">
              <select
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                required
                className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar Operador…</option>
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
                placeholder="+584241234567 o 04241234567"
                required
                className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={calling || !operatorId || !toNumber || deviceState !== 'registered'}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {calling ? 'Llamando…' : 'Llamar'}
              </button>
            </form>
          )}

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
