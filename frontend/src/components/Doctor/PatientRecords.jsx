import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

export default function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.get("/patients");
      setPatients(data);
    } catch (err) {
      setError("Failed to fetch patient records.");
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (patient) => {
    try {
      setSelectedPatient(patient);
      // Fetch patient-specific details (like medical history)
      const details = await api.get(`/patients?user_id=${patient.user_id}`);
      if (details && details.length > 0) {
        setPatientDetails({...patient, ...details[0]});
      } else {
        setPatientDetails(patient);
      }
      // Fetch patient's appointment history
      const appointments = await api.get(`/appointments?patient_id=${patient.patient_id}`);
      setPatientAppointments(appointments);

    } catch (err) {
        setError("Failed to fetch patient details.");
    }
  }
  
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Patient Records</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">All Patients</h3>
            <ul className="space-y-2">
                {patients.map(p => (
                    <li 
                        key={p.user_id} 
                        className={`flex items-center cursor-pointer p-2 rounded-md transition-colors duration-200 ${selectedPatient?.user_id === p.user_id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                        onClick={() => selectPatient(p)}
                    >
                        <UserIcon />
                        {p.full_name}
                    </li>
                ))}
            </ul>
        </div>
        <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-2xl font-bold mb-4">Patient Details</h3>
             {selectedPatient && patientDetails ? (
                <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><p><strong>Name:</strong> {patientDetails.full_name}</p></div>
                        <div><p><strong>Email:</strong> {patientDetails.email}</p></div>
                        <div><p><strong>Phone:</strong> {patientDetails.phone}</p></div>
                        <div><p><strong>Date of Birth:</strong> {patientDetails.date_of_birth}</p></div>
                        <div><p><strong>Blood Group:</strong> {patientDetails.blood_group}</p></div>
                    </div>

                    <div className="mt-4">
                        <h4 className="text-xl font-semibold">Medical History</h4>
                        <textarea 
                            className="w-full mt-2 p-2 border rounded bg-gray-50"
                            rows="4"
                            defaultValue={patientDetails.medical_history || 'No medical history provided.'}
                            // onBlur={(e) => updateMedicalHistory(e.target.value)} // Add this function if needed
                        />
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="text-xl font-semibold">Appointment History</h4>
                        <ul className="mt-2 space-y-3">
                            {patientAppointments.length > 0 ? patientAppointments.map(appt => (
                                <li key={appt.appointment_id} className="p-3 bg-gray-50 rounded-md border">
                                    <p><strong>Date:</strong> {new Date(appt.appointment_date).toLocaleDateString()} with <strong>Dr. {appt.doctor_name}</strong></p>
                                    <p><strong>Reason:</strong> {appt.reason}</p>
                                    <p><strong>Status:</strong> {appt.status}</p>
                                    {appt.notes && <p className="mt-1 text-sm text-gray-600"><strong>Notes:</strong> {appt.notes}</p>}
                                </li>
                            )) : <p>No appointment history.</p>}
                        </ul>
                    </div>
                </div>
             ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">Select a patient to view their details.</p>
                </div>
             )}
        </div>
      </div>
    </div>
  );
}