import { ErrorBoundary as REB, type FallbackProps } from "react-error-boundary";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from "@patternfly/react-core";
import ExclamationCircleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import { track } from "@/shared/telemetry/telemetry";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <PageSection>
      <EmptyState
        titleText="Something went wrong"
        icon={ExclamationCircleIcon}
        status="danger"
        headingLevel="h1"
      >
        <EmptyStateBody>
          <pre style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant="primary" onClick={resetErrorBoundary}>
              Try again
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
}

export function ErrorBoundary({
  children,
  resetKeys,
}: {
  children: React.ReactNode;
  resetKeys?: unknown[];
}) {
  return (
    <REB
      FallbackComponent={Fallback}
      resetKeys={resetKeys}
      onError={(err, info) => {
        console.error("ErrorBoundary caught:", err, info);
        const message = err instanceof Error ? err.message : String(err);
        const stack =
          err instanceof Error
            ? (err.stack ?? info?.componentStack ?? undefined)
            : (info?.componentStack ?? undefined);
        track({
          type: "error",
          route:
            typeof window !== "undefined" ? window.location.pathname : undefined,
          error_message: message,
          error_stack: stack ?? undefined,
        });
      }}
    >
      {children}
    </REB>
  );
}
