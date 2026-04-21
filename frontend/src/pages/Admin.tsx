import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { useStore } from '../store';
import { TrialAccount } from '../types';

function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function Admin() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [trials, setTrials] = useState<TrialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', days: '3', max_calls: '10' });
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'master') { navigate('/dashboard'); return; }
    fetchTrials();
  }, [user]);

  async function fetchTrials() {
    try {
      const data = await apiClient.getTrialAccounts();
      setTrials(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    if (!form.name || !form.email || !form.password) {
      setFormError('Todos los campos son obligatorios');
      return;
    }
    setCreating(true);
    try {
      await apiClient.createTrialAccount({
        name: form.name,
        email: form.email,
        password: form.password,
        days: parseInt(form.days),
        max_calls: parseInt(form.max_calls)
      });
      setSuccess(`Cuenta de prueba creada para ${form.email}`);
      setForm({ name: '', email: '', password: '', days: '3', max_calls: '10' });
      fetchTrials();
    } catch (err: any) {
      setFormError(err.error || 'Error al crear la cuenta');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(trial: TrialAccount) {
    try {
      await apiClient.updateTrialAccount(trial.id, { is_active: !trial.is_active });
      fetchTrials();
    } catch { /* ignore */ }
  }

  async function extendTrial(trial: TrialAccount) {
    try {
      await apiClient.updateTrialAccount(trial.id, { days: 3 });
      fetchTrials();
    } catch { /* ignore */ }
  }

  async function deleteTrial(id: string) {
    if (!confirm('¿Eliminar esta cuenta de prueba?')) return;
    try {
      await apiClient.deleteTrialAccount(id);
      fetchTrials();
    } catch { /* ignore */ }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Cuentas de Prueba</h1>
          <p className="text-slate-400 mt-1">Administra accesos temporales de 3 días / 10 llamadas</p>
        </div>

        {/* Create Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Crear Cuenta de Prueba</h2>
          {formError && <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">{formError}</div>}
          {success && <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded text-green-300 text-sm">{success}</div>}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Empresa o persona"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="usuario@ejemplo.com"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
              <input
                type="text"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Contraseña de acceso"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Días de prueba</label>
                <input
                  type="number" min="1" max="30"
                  value={form.days}
                  onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Máx. llamadas</label>
                <input
                  type="number" min="1" max="100"
                  value={form.max_calls}
                  onChange={e => setForm(f => ({ ...f, max_calls: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {creating ? 'Creando...' : 'Crear Cuenta de Prueba'}
              </button>
            </div>
          </form>
        </div>

        {/* Trial Accounts List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Cuentas Activas ({trials.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando...</div>
          ) : trials.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay cuentas de prueba</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    {['Nombre', 'Email', 'Vence', 'Llamadas', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {trials.map(t => {
                    const days = daysLeft(t.trial_expires_at);
                    const expired = days === 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                        <td className="px-4 py-3 text-slate-300 text-sm">{t.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${expired ? 'text-red-400' : days <= 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {expired ? 'Expirada' : `${days}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${t.calls_used >= t.max_calls ? 'text-red-400' : 'text-slate-300'}`}>
                            {t.calls_used}/{t.max_calls}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.is_active ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                            {t.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => extendTrial(t)} className="text-xs text-blue-400 hover:text-blue-300">+3d</button>
                            <button onClick={() => toggleActive(t)} className="text-xs text-yellow-400 hover:text-yellow-300">
                              {t.is_active ? 'Pausar' : 'Activar'}
                            </button>
                            <button onClick={() => deleteTrial(t.id)} className="text-xs text-red-400 hover:text-red-300">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
