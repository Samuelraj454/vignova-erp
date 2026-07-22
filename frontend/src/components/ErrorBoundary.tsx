import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-3xl font-bold text-destructive">Something went wrong.</h1>
            <div className="p-4 rounded-md bg-muted overflow-auto text-left">
              <pre className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                {this.state.error?.message}
              </pre>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
