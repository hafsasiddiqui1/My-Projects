import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "Patient", // Default role
  });
  const [addUserError, setAddUserError] = useState(null);
  const [addingUser, setAddingUser] = useState(false);

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    is_active: true,
  });
  const [editUserError, setEditUserError] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get("/users");
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setAddUserError(null);
    try {
      await api.post("/users", newUser);
      setNewUser({
        username: "",
        password: "",
        full_name: "",
        email: "",
        role: "Patient",
      });
      setShowAddUserForm(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setAddUserError(err.data?.error || "Failed to add user.");
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditUserForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      is_active: user.is_active,
    });
    setShowEditUserModal(true);
  };

  const handleEditUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setUpdatingUser(true);
    setEditUserError(null);
    try {
      await api.put(`/users/${editingUser.user_id}`, editUserForm);
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setEditUserError(err.data?.error || "Failed to update user.");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert(err.data?.error || "Failed to delete user.");
      }
    }
  };


  if (loading) {
    return <div className="text-center mt-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      <button
        onClick={() => setShowAddUserForm(!showAddUserForm)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showAddUserForm ? "Cancel Add User" : "Add New User"}
      </button>

      {showAddUserForm && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-xl font-semibold mb-3">Add New User</h3>
          <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleNewUserChange}
              placeholder="Username"
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleNewUserChange}
              placeholder="Password"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="full_name"
              value={newUser.full_name}
              onChange={handleNewUserChange}
              placeholder="Full Name"
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleNewUserChange}
              placeholder="Email"
              className="border p-2 rounded"
              required
            />
            <select
              name="role"
              value={newUser.role}
              onChange={handleNewUserChange}
              className="border p-2 rounded"
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              {currentUser && currentUser.role === "Admin" && (
                <option value="Sub-Admin">Sub-Admin</option>
              )}
            </select>
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={addingUser}
              >
                {addingUser ? "Adding..." : "Add User"}
              </button>
              {addUserError && <p className="text-red-500 text-sm mt-2">{addUserError}</p>}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.is_active ? "Active" : "Inactive"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  {currentUser && currentUser.user_id !== user.user_id && (
                    <button
                      onClick={() => handleDeleteUser(user.user_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Edit User: {editingUser.username}</h3>
            <form onSubmit={handleEditUserSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="full_name"
                value={editUserForm.full_name}
                onChange={handleEditUserChange}
                placeholder="Full Name"
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={editUserForm.email}
                onChange={handleEditUserChange}
                placeholder="Email"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="phone"
                value={editUserForm.phone}
                onChange={handleEditUserChange}
                placeholder="Phone"
                className="border p-2 rounded"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={editUserForm.is_active}
                  onChange={handleEditUserChange}
                  className="mr-2"
                />
                <label htmlFor="is_active">Is Active</label>
              </div>
              {editUserError && <p className="text-red-500 text-sm mt-2">{editUserError}</p>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={updatingUser}
                >
                  {updatingUser ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
