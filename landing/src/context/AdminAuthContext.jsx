import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const AdminAuthContext = createContext(null);

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours persistent session
const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 Hours inactivity timeout

export const AdminAuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      const authFlag = localStorage.getItem("guessup_admin_auth") || sessionStorage.getItem("guessup_admin_auth");
      const timestamp = localStorage.getItem("guessup_admin_auth_ts") || sessionStorage.getItem("guessup_admin_auth_ts");

      if (authFlag === "true" && timestamp) {
        const elapsed = Date.now() - parseInt(timestamp, 10);
        if (elapsed < SESSION_DURATION_MS) {
          return true;
        }
      }
    } catch (_) {}
    return false;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const inactivityTimerRef = useRef(null);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("guessup_admin_auth");
      localStorage.removeItem("guessup_admin_auth_ts");
      sessionStorage.removeItem("guessup_admin_auth");
      sessionStorage.removeItem("guessup_admin_auth_ts");
    } catch (_) {}

    setIsAdminLoggedIn(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  const login = (passkey) => {
    const validSecret = import.meta.env.VITE_ADMIN_SECRET || "admin123";
    if (passkey && passkey.trim() === validSecret.trim()) {
      const now = Date.now().toString();
      try {
        localStorage.setItem("guessup_admin_auth", "true");
        localStorage.setItem("guessup_admin_auth_ts", now);
        sessionStorage.setItem("guessup_admin_auth", "true");
        sessionStorage.setItem("guessup_admin_auth_ts", now);
      } catch (_) {}

      setIsAdminLoggedIn(true);
      setIsAuthModalOpen(false);
      return { success: true };
    } else {
      return { success: false, message: "Invalid Admin Passkey" };
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Inactivity & Expiry Timer
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      // Refresh timestamp on activity
      try {
        const now = Date.now().toString();
        localStorage.setItem("guessup_admin_auth_ts", now);
        sessionStorage.setItem("guessup_admin_auth_ts", now);
      } catch (_) {}

      inactivityTimerRef.current = setTimeout(() => {
        console.warn("Admin session expired after inactivity.");
        logout();
      }, INACTIVITY_LIMIT_MS);
    };

    resetInactivityTimer();

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [isAdminLoggedIn, logout]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminLoggedIn,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
