import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); 

  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: "Monday", 
    start_time: "09:00",
    end_time: "17:00",
  });
  const [addSlotError, setAddSlotError] = useState(null);
  const [addingSlot, setAddingSlot] = useState(false);

  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editSlotForm, setEditSlotForm] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    is_available: true,
  });
  const [editSlotError, setEditSlotError] = useState(null);
  const [updatingSlot, setUpdatingSlot] = useState(false);

  useEffect(() => {
    if (user && user.doctor_id) {
        fetchSchedules();
    } else if (!user) {
        setError("User not authenticated.");
        setLoading(false);
    } else if (user.role !== "Doctor") {
        setError("Only doctors can manage schedules.");
        setLoading(false);
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/schedules?doctor_id=${user.doctor_id}`);
      setSchedules(data);
    } catch (err) {
      setError(err.message || "Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  const groupSchedulesByDay = (scheduleList) => {
    const grouped = {};
    const daysOfWeek = [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday"
    ];

    daysOfWeek.forEach(day => {
        grouped[day] = scheduleList.filter(s => s.day_of_week === day).sort((a,b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  };

  const handleNewSlotChange = (e) => {
    const { name, value } = e.target;
    setNewSlot((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlotSubmit = async (e) => {
    e.preventDefault();
    setAddingSlot(true);
    setAddSlotError(null);
    try {
      await api.post("/schedules", { ...newSlot, doctor_id: user.doctor_id });
      setNewSlot({
        day_of_week: "Monday", 
        start_time: "09:00",
        end_time: "17:00",
      });
      setShowAddSlotForm(false);
      fetchSchedules(); // Refresh the list
    } catch (err) {
      setAddSlotError(err.data?.error || "Failed to add schedule slot.");
    } finally {
      setAddingSlot(false);
    }
  };

  const handleEditClick = (slot) => {
    setEditingSlot(slot);
    setEditSlotForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available,
    });
    setShowEditSlotModal(true);
  };

  const handleEditSlotChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditSlotForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSlotSubmit = async (e) => {
    e.preventDefault();
    setUpdatingSlot(true);
    setEditSlotError(null);
    try {
      await api.put(`/schedules/${editingSlot.schedule_id}`, editSlotForm);
      setShowEditSlotModal(false);
      setEditingSlot(null);
      fetchSchedules(); // Refresh the list
    } catch (err) {
      setEditSlotError(err.data?.error || "Failed to update schedule slot.");
    } finally {
      setUpdatingSlot(false);
    }
  };

  const [deletingId, setDeletingId] = useState(null);
  const handleDelete = async (schedule_id) => {
    if (window.confirm("Are you sure you want to delete this schedule slot?")) {
        setDeletingId(schedule_id);
        try {
            await api.delete(`/schedules/${schedule_id}`);
            fetchSchedules(); 
        } catch (err) {
            setError(err.data?.error || "Failed to delete schedule slot.");
        } finally {
            setDeletingId(null);
        }
    }
  };
  if (loading) {
    return <div className="text-center mt-4">Loading schedules...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-500">{error}</div>;
  }

  const groupedSchedules = groupSchedulesByDay(schedules);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Schedule Manager</h2>

      <button
        onClick={() => setShowAddSlotForm(!showAddSlotForm)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showAddSlotForm ? "Cancel Add Slot" : "Add New Schedule Slot"}
      </button>

      {showAddSlotForm && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-xl font-semibold mb-3">Add New Schedule Slot</h3>
          <form onSubmit={handleAddSlotSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="day_of_week"
              value={newSlot.day_of_week}
              onChange={handleNewSlotChange}
              className="border p-2 rounded"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <option key={day} value={day}>{day}</option>
                )
              )}
            </select>
            <input
              type="time"
              name="start_time"
              value={newSlot.start_time}
              onChange={handleNewSlotChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="time"
              name="end_time"
              value={newSlot.end_time}
              onChange={handleNewSlotChange}
              className="border p-2 rounded"
              required
            />
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={addingSlot}
              >
                {addingSlot ? "Adding..." : "Add Slot"}
              </button>
              {addSlotError && <p className="text-red-500 text-sm mt-2">{addSlotError}</p>}
            </div>
          </form>
        </div>
      )}

      {Object.keys(groupedSchedules).map(day => (
        <div key={day} className="mb-6 bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-3">{day}</h3>
          {groupedSchedules[day].length > 0 ? (
            <ul>
              {groupedSchedules[day].map(slot => (
                <li key={slot.schedule_id} className="py-2 border-b last:border-b-0 flex justify-between items-center">
                  <span>{slot.start_time} - {slot.end_time} {slot.is_available ? "(Available)" : "(Not Available)"}</span>
                  <div>
                    <button
                        onClick={() => handleEditClick(slot)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        disabled={deletingId === slot.schedule_id}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDelete(slot.schedule_id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deletingId === slot.schedule_id}
                    >
                        {deletingId === slot.schedule_id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No schedule set for {day}.</p>
          )}
        </div>
      ))}

      {showEditSlotModal && editingSlot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Edit Schedule Slot</h3>
            <form onSubmit={handleEditSlotSubmit} className="flex flex-col gap-4">
            <select
              name="day_of_week"
              value={editSlotForm.day_of_week}
              onChange={handleEditSlotChange}
              className="border p-2 rounded"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <option key={day} value={day}>{day}</option>
                )
              )}
            </select>
            <input
                type="time"
                name="start_time"
                value={editSlotForm.start_time}
                onChange={handleEditSlotChange}
                placeholder="Start Time"
                className="border p-2 rounded"
                required
              />
              <input
                type="time"
                name="end_time"
                value={editSlotForm.end_time}
                onChange={handleEditSlotChange}
                placeholder="End Time"
                className="border p-2 rounded"
                required
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={editSlotForm.is_available}
                  onChange={handleEditSlotChange}
                  className="mr-2"
                />
                <label htmlFor="is_available">Is Available</label>
              </div>
              {editSlotError && <p className="text-red-500 text-sm mt-2">{editSlotError}</p>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditSlotModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={updatingSlot}
                >
                  {updatingSlot ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
