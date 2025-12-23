import React from "react";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-4 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
