import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useToast } from "../context/ToastContext";

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export const useInactivityLogout = (user, onLogout) => {
  const { showToast } = useToast();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!user) return;

    timerRef.current = setTimeout(async () => {
      try {
        await signOut(auth);
        showToast("Session expired due to inactivity. Please log in again.", "error");
        if (onLogout) onLogout();
      } catch (err) {
        console.error("Auto logout failed:", err);
      }
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set up listeners
    const handleActivity = () => {
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach((evt) => {
      document.addEventListener(evt, handleActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => {
        document.removeEventListener(evt, handleActivity);
      });
    };
  }, [user]);
};
