import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md w-auto z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-lg border-l-4 font-bold flex justify-between items-center pointer-events-auto bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark ${
                toast.type === "success"
                  ? "border-success"
                  : toast.type === "error"
                  ? "border-error"
                  : "border-primary"
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-xl cursor-pointer font-bold opacity-60 hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
