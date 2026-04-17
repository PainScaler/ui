import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "./telemetry";

export function useRouteTracker(): void {
  const location = useLocation();
  useEffect(() => {
    track({ type: "page_view", route: location.pathname });
  }, [location.pathname]);
}
