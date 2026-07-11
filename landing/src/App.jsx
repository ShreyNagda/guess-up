import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { PatternCanvas } from "./components/PatternCanvas";
import { LandingPage } from "./pages/LandingPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          {/* Animated Scrolling Background Patterns */}
          <PatternCanvas />
          
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
