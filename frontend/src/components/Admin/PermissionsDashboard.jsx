import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

export default function PermissionsDashboard() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingPermId, setUpdatingPermId] = useState(null);
  const { user } = useAuth(); // Get the current user from AuthContext

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await api.get("/permissions");
      setPermissions(data);
    } catch (err) {
      setError(err.message || "Failed to fetch permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (permId, field, value) => {
    setUpdatingPermId(permId);
    try {
      // Optimistic UI update
      setPermissions((prevPerms) =>
        prevPerms.map((perm) =>
          perm.permission_id === permId ? { ...perm, [field]: value } : perm
        )
      );

      await api.put(`/permissions/${permId}`, { [field]: value });
      // If API call succeeds, the optimistic update is fine.
    } catch (err) {
      setError(err.data?.error || `Failed to update permission for ${field}.`);
      // Revert optimistic update on error
      setPermissions((prevPerms) =>
        prevPerms.map((perm) =>
          perm.permission_id === permId ? { ...perm, [field]: !value } : perm
        )
      );
    } finally {
      setUpdatingPermId(null);
    }
  };

  // Filter permissions based on user role
  const filteredPermissions = permissions.filter((perm) => {
    if (user && user.role === "Sub-Admin") {
      // Sub-admins can only see/modify Doctor and Patient permissions
      return perm.role === "Doctor" || perm.role === "Patient";
    }
    // Admins see all permissions
    return true;
  });

  if (loading) {
    return <div className="text-center mt-4">Loading permissions...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Permissions Dashboard</h2>

      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Create</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPermissions.map((perm) => ( // Use filteredPermissions here
              <tr key={perm.permission_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{perm.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{perm.resource}</td>
                {['can_create', 'can_read', 'can_update', 'can_delete'].map(
                  (field) => (
                    <td key={field} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="checkbox"
                        checked={perm[field]}
                        onChange={(e) =>
                          handlePermissionChange(perm.permission_id, field, e.target.checked)
                        }
                        disabled={updatingPermId === perm.permission_id}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {updatingPermId && <p className="text-sm text-blue-500 mt-2">Updating permission...</p>}
    </div>
  );
}
