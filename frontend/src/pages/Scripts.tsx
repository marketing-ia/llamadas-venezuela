import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { SalesScript } from '../types';
import { useStore } from '../store';

export function Scripts() {
  const [scripts, setScripts] = useState<SalesScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const { setError: setStoreError } = useStore();

  useEffect(() => {
    fetchScripts();
  }, [setStoreError]);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getScripts();
      setScripts(data);
    } catch (err: any) {
      const errorMsg = err.error || 'Failed to load scripts';
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
        await apiClient.updateScript(editingId, formData);
      } else {
        await apiClient.createScript(formData);
      }
      setFormData({ title: '', content: '' });
      setShowForm(false);
      setEditingId(null);
      await fetchScripts();
    } catch (err: any) {
      setError(err.error || 'Failed to save script');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      try {
        await apiClient.deleteScript(id);
        await fetchScripts();
      } catch (err: any) {
        setError(err.error || 'Failed to delete script');
      }
    }
  };

  const handleEdit = (script: SalesScript) => {
    setFormData({
      title: script.title,
      content: script.content,
    });
    setEditingId(script.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <Layout currentPage="scripts">
        <div className="text-center text-gray-400">Loading scripts...</div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="scripts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Sales Scripts</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', content: '' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            {showForm ? 'Cancel' : 'New Script'}
          </button>
        </div>

        {error && (
          <div className="text-red-400 bg-red-900/20 p-4 rounded">{error}</div>
        )}

        {showForm && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingId ? 'Edit' : 'New'} Script
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Script title"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter your sales script here..."
                  rows={8}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-8">
              No scripts found
            </div>
          ) : (
            scripts.map((script) => (
              <div
                key={script.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {script.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {script.content}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(script)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(script.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
