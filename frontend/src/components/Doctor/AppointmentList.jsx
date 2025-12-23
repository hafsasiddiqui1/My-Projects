import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// Icons using heroicons syntax
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  useEffect(() => {
    if (user && user.role === "Doctor") {
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

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status });
      fetchAppointments(); // Refresh list
    } catch (err) {
        setError(err.data?.error || "Failed to update appointment status.");
    }
  };

  const openModal = (appointment) => {
    setSelectedAppt(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppt(null);
  };
  
    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

  if (error) {
    return <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Appointments</h2>
      
      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <div key={appt.appointment_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="p-5">
                <p className="text-xl font-semibold text-gray-900">{appt.patient_name}</p>
                <div className="text-gray-600 mt-2">
                    <div className="flex items-center"><CalendarIcon /> {new Date(appt.appointment_date).toLocaleDateString()}</div>
                    <div className="flex items-center"><ClockIcon /> {appt.appointment_time}</div>
                </div>
                <p className="text-sm mt-2 text-gray-500 truncate">Reason: {appt.reason}</p>
                <div className="mt-4">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        appt.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                        appt.status === "Completed" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                    }`}>
                        {appt.status}
                    </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <button onClick={() => openModal(appt)} className="text-sm text-blue-600 hover:underline">View Details</button>
                {appt.status === "Scheduled" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateAppointmentStatus(appt.appointment_id, "Completed")} className="text-sm text-green-600 hover:underline">Complete</button>
                    <button onClick={() => updateAppointmentStatus(appt.appointment_id, "No-Show")} className="text-sm text-yellow-600 hover:underline">No-Show</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <h3 className="text-xl text-gray-700">You have no appointments.</h3>
        </div>
      )}

    {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">{selectedAppt.patient_name}</h3>
            <p><strong>Date:</strong> {new Date(selectedAppt.appointment_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedAppt.appointment_time}</p>
            <p><strong>Reason:</strong> {selectedAppt.reason}</p>
            <p><strong>Status:</strong> {selectedAppt.status}</p>
            <div className="mt-4">
                <h4 className="font-semibold">Notes</h4>
                <textarea 
                    defaultValue={selectedAppt.notes}
                    onBlur={(e) => api.put(`/appointments/${selectedAppt.appointment_id}`, { notes: e.target.value })}
                    className="w-full mt-1 p-2 border rounded"
                    rows="3"
                    placeholder="Add notes for this appointment..."
                ></textarea>
            </div>
            <div className="mt-6 text-right">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}