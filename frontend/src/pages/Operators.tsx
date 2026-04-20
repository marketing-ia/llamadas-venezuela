import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { Operator } from '../types';
import { useStore } from '../store';

export function Operators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    twilioNumber: '',
    sipUri: '',
  });
  const [callingOperator, setCallingOperator] = useState<Operator | null>(null);
  const [toNumber, setToNumber] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
  const [callMessage, setCallMessage] = useState('');
  const { setError: setStoreError } = useStore();

  useEffect(() => {
    fetchOperators();
  }, [setStoreError]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOperators();
      setOperators(data.operators ?? []);
    } catch (err: any) {
      const errorMsg = err.error || 'Failed to load operators';
      setError(errorMsg);
      setStoreError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.updateOperator(editingId, formData);
      } else {
        await apiClient.createOperator(formData);
      }
      setFormData({ name: '', twilioNumber: '', sipUri: '' });
      setShowForm(false);
      setEditingId(null);
      await fetchOperators();
    } catch (err: any) {
      setError(err.error || 'Failed to save operator');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      try {
        await apiClient.deleteOperator(id);
        await fetchOperators();
      } catch (err: any) {
        setError(err.error || 'Failed to delete operator');
      }
    }
  };

  const handleEdit = (operator: Operator) => {
    setFormData({
      name: operator.name,
      twilioNumber: operator.twilio_number,
      sipUri: operator.sip_uri,
    });
    setEditingId(operator.id);
    setShowForm(true);
  };

  const openCallModal = (operator: Operator) => {
    setCallingOperator(operator);
    setToNumber('');
    setCallStatus('idle');
    setCallMessage('');
  };

  const closeCallModal = () => {
    setCallingOperator(null);
    setCallStatus('idle');
  };

  const handleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callingOperator || !toNumber.trim()) return;
    setCallStatus('calling');
    try {
      const result = await apiClient.initiateCall(callingOperator.id, toNumber.trim());
      setCallStatus('success');
      setCallMessage(`Llamada iniciada: ${result.callSid}`);
    } catch (err: any) {
      setCallStatus('error');
      setCallMessage(err.error || 'Error al iniciar la llamada');
    }
  };

  if (loading) {
    return (
      <Layout currentPage="operators">
        <div className="text-center text-slate-400">Loading operators...</div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="operators">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Operators</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', twilioNumber: '', sipUri: '' });
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Operator'}
          </button>
        </div>

        {error && (
          <div className="text-red-400 bg-red-900/30 border border-red-700 p-4 rounded">{error}</div>
        )}

        {showForm && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingId ? 'Edit' : 'New'} Operator
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Operator name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Twilio Number</label>
                <input
                  type="tel"
                  value={formData.twilioNumber}
                  onChange={(e) => setFormData({ ...formData, twilioNumber: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">SIP URI</label>
                <input
                  type="text"
                  value={formData.sipUri}
                  onChange={(e) => setFormData({ ...formData, sipUri: e.target.value })}
                  placeholder="sip://user@host.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-300 font-medium">Name</th>
                  <th className="px-6 py-3 text-left text-slate-300 font-medium">Twilio Number</th>
                  <th className="px-6 py-3 text-left text-slate-300 font-medium">SIP URI</th>
                  <th className="px-6 py-3 text-left text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No operators found
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-white">{op.name}</td>
                      <td className="px-6 py-4 text-slate-200">{op.twilio_number}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">{op.sip_uri}</td>
                      <td className="px-6 py-4 flex space-x-2">
                        <button
                          onClick={() => openCallModal(op)}
                          className="text-green-400 hover:text-green-300 font-medium"
                        >
                          Llamar
                        </button>
                        <button
                          onClick={() => handleEdit(op)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(op.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {callingOperator && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-1">Iniciar llamada</h3>
            <p className="text-slate-400 text-sm mb-4">
              Operador: <span className="text-white font-medium">{callingOperator.name}</span>
              {' '}desde <span className="text-white font-medium">{callingOperator.twilio_number}</span>
            </p>

            {callStatus === 'success' ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-900/40 border border-green-600 rounded text-green-400 text-sm break-all">
                  {callMessage}
                </div>
                <button
                  onClick={closeCallModal}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 px-4 rounded transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCall} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Numero a llamar
                  </label>
                  <input
                    type="tel"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    placeholder="+58412xxxxxxx"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                    disabled={callStatus === 'calling'}
                    autoFocus
                    required
                  />
                </div>

                {callStatus === 'error' && (
                  <div className="p-3 bg-red-900/40 border border-red-600 rounded text-red-400 text-sm">
                    {callMessage}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={callStatus === 'calling' || !toNumber.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {callStatus === 'calling' ? 'Llamando...' : 'Llamar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeCallModal}
                    disabled={callStatus === 'calling'}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 py-2 px-4 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
