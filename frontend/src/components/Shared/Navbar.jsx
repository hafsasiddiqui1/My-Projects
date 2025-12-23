import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getNavLinks = (role) => {
  switch (role) {
    case "Admin":
      return [
        { to: "/admin", text: "User Management" },
        { to: "/admin/permissions", text: "Permissions" },
        { to: "/admin/reports", text: "Reports" },
      ];
    case "Doctor":
      return [
        { to: "/doctor", text: "Schedule" },
        { to: "/doctor/appointments", text: "Appointments" },
        { to: "/doctor/records", text: "Patient Records" },
      ];
    case "Patient":
      return [
        { to: "/patient", text: "Book Appointment" },
        { to: "/patient/my", text: "My Appointments" },
        { to: "/patient/billing", text: "Billing" },
      ];
    default:
      return [];
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navLinks = user ? getNavLinks(user.role) : [];

  return (
    <header className="bg-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">
          ClinicApp
        </Link>
        <nav className="flex items-center gap-4">
          {user &&
            navLinks.map(({ to, text }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm ${
                    isActive
                      ? "text-blue-600 font-semibold"
                      : "text-gray-600 hover:text-blue-500"
                  }`
                }
              >
                {text}
              </NavLink>
            ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.username} ({user.role})
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
