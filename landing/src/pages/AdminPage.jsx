import React from "react";
import { AdminDashboard } from "../components/AdminDashboard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const AdminPage = () => {
  return (
    <div className="flex flex-col min-h-screen text-text-dark bg-bg-dark">
      <Header />
      <main className="flex-1 py-8">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
};
