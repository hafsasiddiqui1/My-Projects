import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await api.get("/doctors");
      setDoctors(data);
    } catch (err) {
      setError("Failed to fetch doctors.");
    }
  };

  const handleDoctorChange = async (e) => {
    const doctorId = e.target.value;
    setSelectedDoctor(doctorId);
    if (doctorId) {
      try {
        const data = await api.get(`/schedules?doctor_id=${doctorId}`);
        setSchedules(data);
      } catch (err) {
        setError("Failed to fetch schedules for this doctor.");
        setSchedules([]);
      }
    } else {
      setSchedules([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/appointments", {
        doctor_id: selectedDoctor,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason,
      });
      setSuccess("Appointment booked successfully!");
      setSelectedDoctor("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
    } catch (err) {
      setError(err.data?.error || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Book an Appointment</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">Select Doctor</label>
          <select
            value={selectedDoctor}
            onChange={handleDoctorChange}
            className="w-full mt-1 p-2 border rounded"
            required
          >
            <option value="">-- Select a Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.doctor_id} value={doc.doctor_id}>
                {doc.full_name} ({doc.specialization})
              </option>
            ))}
          </select>
        </div>

        {schedules.length > 0 && (
          <div className="mb-4">
             <label className="block text-gray-700">Available Slots</label>
             <ul>
                {schedules.map(slot => (
                    <li key={slot.schedule_id}>{slot.day_of_week}: {slot.start_time} - {slot.end_time}</li>
                ))}
             </ul>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Time</label>
          <input
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Reason for Appointment</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            rows="3"
            required
          ></textarea>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}
