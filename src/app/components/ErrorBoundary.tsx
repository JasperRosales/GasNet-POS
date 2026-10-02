import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("POS app crashed.", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#FFFDF1] flex items-center justify-center p-6">
          <div className="max-w-lg rounded-2xl bg-white p-8 shadow-lg">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-sm text-[#1B211A] mb-1">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
            <button
              className="mt-4 px-4 py-2 rounded-lg bg-[#628141] text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
