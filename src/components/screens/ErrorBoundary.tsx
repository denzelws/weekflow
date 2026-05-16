import { Component, type ReactNode, type ErrorInfo } from "react";
import { storage } from "@/utils/storage";

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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[WeekFlow] Unhandled error:", error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-dvh flex flex-col items-center justify-center
                        bg-surface px-6 text-center gap-6"
        >
          <span className="text-5xl">⚠️</span>
          <div>
            <h2 className="text-h3 mb-2">Algo deu errado</h2>
            <p className="text-body text-muted">
              {this.state.error.message ?? "Erro inesperado. Tente novamente."}
            </p>
          </div>
          <button onClick={this.handleReset} className="btn-primary btn">
            Tentar novamente
          </button>
          <button
            onClick={() => {
              storage.resetAll();
              window.location.reload();
            }}
            className="btn-ghost btn text-sm"
          >
            Limpar dados e reiniciar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
