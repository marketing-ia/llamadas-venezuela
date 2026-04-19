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
  const { setError: setStoreError } = useStore();

  useEffect(() => {
    fetchOperators();
  }, [setStoreError]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOperators();
      setOperators(data);
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

  if (loading) {
    return (
      <Layout currentPage="operators">
        <div className="text-center text-gray-400">Loading operators...</div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Operator'}
          </button>
        </div>

        {error && (
          <div className="text-red-400 bg-red-900/20 p-4 rounded">{error}</div>
        )}

        {showForm && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingId ? 'Edit' : 'New'} Operator
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Operator name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twilio Number
                </label>
                <input
                  type="tel"
                  value={formData.twilioNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, twilioNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SIP URI
                </label>
                <input
                  type="text"
                  value={formData.sipUri}
                  onChange={(e) =>
                    setFormData({ ...formData, sipUri: e.target.value })
                  }
                  placeholder="sip://user@host.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors"
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
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-gray-300">Twilio Number</th>
                  <th className="px-6 py-3 text-left text-gray-300">SIP URI</th>
                  <th className="px-6 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No operators found
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="border-b border-slate-700 hover:bg-slate-750">
                      <td className="px-6 py-4 text-gray-300">{op.name}</td>
                      <td className="px-6 py-4 text-gray-300">{op.twilio_number}</td>
                      <td className="px-6 py-4 text-gray-300 text-xs font-mono">
                        {op.sip_uri}
                      </td>
                      <td className="px-6 py-4 flex space-x-2">
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
    </Layout>
  );
}
