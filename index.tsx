
import React, { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App = lazy(() => import('./App').catch(err => {
  console.error("Failed to load App", err);
  return { default: () => <div style={{color:'red', background:'white', padding:'20px'}}>Failed to load App: {err.message}</div> };
}));

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{color:'white', background:'black', padding:'20px'}}>Loading App...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);