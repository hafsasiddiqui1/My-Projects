import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";

export default function SystemReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.get("/stats");
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to fetch system reports.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-4">Loading reports...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">System Reports</h2>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl text-blue-600">{stats.total_users}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Doctors</h3>
            <p className="text-3xl text-green-600">{stats.total_doctors}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Patients</h3>
            <p className="text-3xl text-purple-600">{stats.total_patients}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Appointments</h3>
            <p className="text-3xl text-yellow-600">{stats.total_appointments}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Pending Billings</h3>
            <p className="text-3xl text-red-600">{stats.pending_billings}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-3xl text-teal-600">${stats.total_revenue?.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <p className="text-center mt-4">No data available.</p>
      )}
    </div>
  );
}
