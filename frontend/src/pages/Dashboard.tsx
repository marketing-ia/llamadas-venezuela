import { Layout } from '../components/Layout';

export function Dashboard() {
  return (
    <Layout currentPage="dashboard">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Today's Calls</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Total Minutes</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Today's Cost</p>
            <p className="text-3xl font-bold text-white">$0.00</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Budget Usage</p>
            <p className="text-3xl font-bold text-white">0%</p>
          </div>
        </div>

        <p className="text-gray-400">
          Dashboard data will be populated in Task 13-14
        </p>
      </div>
    </Layout>
  );
}
