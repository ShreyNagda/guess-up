import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0e0c1c] text-white font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-surface-dark border border-border-dark shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Something Went Wrong
              </h2>
              <p className="text-xs text-muted-dark leading-relaxed">
                An unexpected UI rendering error occurred. Don't worry, your
                data and preferences are completely safe.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 rounded-2xl bg-primary text-[#0e0c1c] font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
