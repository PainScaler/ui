import { useEffect, useState } from "react";
import { AppLayout } from "@/layout/AppLayout";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { LoadingScreen } from "@/app/LoadingScreen/LoadingScreen";
import { startTelemetry } from "@/shared/telemetry/telemetry";
import { useRouteTracker } from "@/shared/telemetry/useRouteTracker";
import "@/App.css";

export const App: React.FunctionComponent = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startTelemetry();
  }, []);

  useRouteTracker();

  if (!ready) {
    return <LoadingScreen onDone={() => setReady(true)} />;
  }

  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
};
