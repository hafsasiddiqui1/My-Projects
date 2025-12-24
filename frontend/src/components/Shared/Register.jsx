import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

// Icons
const UserCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-blue-500 mx-auto mb-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.006 0 0010 16a5.986 5.006 0 004.546-2.084A5 5 0 0010 11z"
      clipRule="evenodd"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);

const EnvelopeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0018 4H2a2 2 0 00-.003 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const LockClosedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06L6.22 10.735a4 4 0 007.56 0l-.145-.73A1 1 0 0115.847 8H18a1 1 0 011 1v11a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.586l-2.729 2.729A7.962 7.962 0 0110 16a7.962 7.962 0 01-5.271-1.957L2 11.586V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    consultation_fee: "",
    date_of_birth: "",
    blood_group: "",
    medical_history: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "full_name":
        if (!/^[a-zA-Z\s]+$/.test(value) && value !== "") {
          return "Name can only contain letters and spaces";
        }
        break;
      case "username":
        if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Username can only contain letters, numbers, and underscores";
        }
        if (value.length > 0 && value.length < 3) {
          return "Username must be at least 3 characters";
        }
        // Check if username is only numbers (not allowed)
        if (value && /^[0-9_]+$/.test(value)) {
          return "Username cannot be only numbers. Must contain at least one letter";
        }
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        break;
      case "phone":
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          return "Phone can only contain numbers, +, -, spaces, and parentheses";
        }
        break;
      case "password":
        if (value.length > 0 && value.length < 6) {
          return "Password must be at least 6 characters";
        }
        break;
      case "blood_group":
        if (value && !/^(A|B|AB|O)[+-]?$/i.test(value)) {
          return "Blood group must be A, B, AB, or O (with optional + or -)";
        }
        break;
      case "consultation_fee":
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          return "Consultation fee must be a positive number";
        }
        break;
      case "specialization":
      case "qualification":
        if (value && !/^[a-zA-Z\s.,-]+$/.test(value)) {
          return "Can only contain letters, spaces, and basic punctuation";
        }
        break;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const validationError = validateField(name, value);

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (validationError) {
      setError(validationError);
    } else if (
      name === "confirmPassword" &&
      formData.password &&
      value !== formData.password
    ) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
      setError("Name can only contain letters and spaces");
      return;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    // Check if username is only numbers (not allowed)
    if (/^[0-9_]+$/.test(formData.username)) {
      setError(
        "Username cannot be only numbers. Must contain at least one letter"
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError("Invalid phone number format");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Role-specific validation
    if (formData.role === "Patient") {
      if (
        formData.blood_group &&
        !/^(A|B|AB|O)[+-]?$/i.test(formData.blood_group)
      ) {
        setError("Invalid blood group format (e.g., A+, B-, O+)");
        return;
      }
    }

    if (formData.role === "Doctor") {
      if (
        formData.consultation_fee &&
        (isNaN(formData.consultation_fee) ||
          parseFloat(formData.consultation_fee) < 0)
      ) {
        setError("Consultation fee must be a positive number");
        return;
      }

      if (
        formData.specialization &&
        !/^[a-zA-Z\s.,-]+$/.test(formData.specialization)
      ) {
        setError(
          "Specialization can only contain letters and basic punctuation"
        );
        return;
      }

      if (
        formData.qualification &&
        !/^[a-zA-Z\s.,-]+$/.test(formData.qualification)
      ) {
        setError(
          "Qualification can only contain letters and basic punctuation"
        );
        return;
      }
    }

    setLoading(true);

    const registrationData = { ...formData };
    delete registrationData.confirmPassword;

    if (
      registrationData.role === "Doctor" &&
      registrationData.consultation_fee
    ) {
      registrationData.consultation_fee = parseFloat(
        registrationData.consultation_fee
      );
    } else if (registrationData.role === "Doctor") {
      registrationData.consultation_fee = 0.0;
    }

    if (registrationData.role === "Patient") {
      delete registrationData.specialization;
      delete registrationData.qualification;
      delete registrationData.consultation_fee;
    } else if (registrationData.role === "Doctor") {
      delete registrationData.date_of_birth;
      delete registrationData.blood_group;
      delete registrationData.medical_history;
    }

    try {
      const response = await api.post("/auth/register", registrationData);
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-200 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl border border-gray-200 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <UserCircleIcon />
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 mb-1 sr-only"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon />
              </div>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                required
                aria-label="Full Name"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1 sr-only"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                required
                aria-label="Username"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 sr-only"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                required
                aria-label="Email"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1 sr-only"
            >
              Phone (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone (Optional)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                aria-label="Phone"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1 sr-only"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                required
                aria-label="Password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1 sr-only"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon />
              </div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                required
                aria-label="Confirm Password"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Register as:
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          {/* Conditional Fields for Doctor */}
          {formData.role === "Doctor" && (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                Doctor Details
              </h3>
              <div>
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Specialization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BriefcaseIcon />
                  </div>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Specialization"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    aria-label="Specialization"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="qualification"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Qualification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BriefcaseIcon />
                  </div>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="Qualification"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    aria-label="Qualification"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="consultation_fee"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Consultation Fee
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    $
                  </div>
                  <input
                    type="number"
                    id="consultation_fee"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    placeholder="Consultation Fee"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    min="0"
                    step="0.01"
                    aria-label="Consultation Fee"
                  />
                </div>
              </div>
            </>
          )}

          {/* Conditional Fields for Patient */}
          {formData.role === "Patient" && (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                Patient Details
              </h3>
              <div>
                <label
                  htmlFor="date_of_birth"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon />
                  </div>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    aria-label="Date of Birth"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="blood_group"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Blood Group
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    id="blood_group"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    placeholder="Blood Group (e.g., A+)"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    aria-label="Blood Group"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="medical_history"
                  className="block text-sm font-medium text-gray-700 mb-1 sr-only"
                >
                  Medical History
                </label>
                <textarea
                  id="medical_history"
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  placeholder="Medical History (Optional)"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                  aria-label="Medical History"
                ></textarea>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 animate-pulse">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
            className="text-blue-600 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
