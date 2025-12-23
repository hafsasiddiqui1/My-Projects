import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.get("/appointments");
      setAppointments(data);
    } catch (err) {
      setError("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };
  
  const cancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await api.delete(`/appointments/${appointmentId}`);
        fetchAppointments(); // Refresh the list
      } catch (err) {
        alert(err.data?.error || "Failed to cancel appointment.");
      }
    }
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
      <div className="bg-white p-4 rounded shadow">
        {appointments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {appointments.map((appt) => (
              <li key={appt.appointment_id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Dr. {appt.doctor_name} ({appt.specialization})</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}
                  </p>
                  <p className="text-sm">Reason: {appt.reason}</p>
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appt.status}
                  </span>
                </div>
                {appt.status === 'Scheduled' && (
                    <button 
                        onClick={() => cancelAppointment(appt.appointment_id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Cancel
                    </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no appointments.</p>
        )}
      </div>
    </div>
  );
}
