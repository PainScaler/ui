import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@patternfly/react-core/dist/styles/base.css";
import "@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css";
import "./index.css";
import { App } from "./App.tsx";
import { queryClient } from "./queryClient.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
