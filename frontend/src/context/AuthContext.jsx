import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to fetch user profile (doctor/patient)
  const fetchUserProfile = async (userData) => {
    let profileData = {};
    if (userData.role === "Doctor") {
      try {
        const doctorProfile = await api.get(`/doctors?user_id=${userData.user_id}`);
        if (doctorProfile && doctorProfile.length > 0) {
          profileData = { doctor_id: doctorProfile[0].doctor_id };
        }
      } catch (profileError) {
        console.warn("Failed to fetch doctor profile:", profileError);
        // Continue without doctor_id if fetching fails
      }
    } else if (userData.role === "Patient") {
      try {
        const patientProfile = await api.get(`/patients?user_id=${userData.user_id}`);
        if (patientProfile && patientProfile.length > 0) {
          profileData = { patient_id: patientProfile[0].patient_id };
        }
      } catch (profileError) {
        console.warn("Failed to fetch patient profile:", profileError);
        // Continue without patient_id if fetching fails
      }
    }
    return { ...userData, ...profileData };
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          let userData = await api.get("/auth/me");
          userData = await fetchUserProfile(userData); // Enrich user data
          setUser(userData);
        } catch (error) {
          console.error("Failed to authenticate token or fetch profile:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      let { token, user: userData } = await api.post("/auth/login", { username, password }, false);
      localStorage.setItem("token", token);
      
      userData = await fetchUserProfile(userData); // Enrich user data after login
      setUser(userData);
      
      if (userData.role === "Admin") navigate("/admin");
      else if (userData.role === "Doctor") navigate("/doctor");
      else if (userData.role === "Patient") navigate("/patient");
      else navigate("/");
      
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.data?.error || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return <div>Loading authentication...</div>; 
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
