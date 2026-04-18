import { Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Bullseye, Page, SkipToContent, Spinner } from "@patternfly/react-core";
import { AppMasthead } from "./AppMasthead";
import { AppSidebar } from "./AppSidebar";
import { routes } from "@/router";
import { resetScroll, initResizeScrollClamp } from "@/shared/lib/scroll";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { CommandPaletteProvider } from "@/shared/ui/CommandPalette";
import { DemoBanner } from "@/shared/ui/DemoBanner";

const MAIN_CONTENT_ID = "main-content";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    resetScroll();
  }, [pathname]);
  useEffect(initResizeScrollClamp, []);
  return null;
}

export const AppLayout: React.FunctionComponent = () => {
  const { pathname } = useLocation();
  const handleSkipToContent = (event: React.MouseEvent) => {
    event.preventDefault();
    document.getElementById(MAIN_CONTENT_ID)?.focus();
  };

  return (
    <Page
      banner={<DemoBanner />}
      masthead={<AppMasthead />}
      sidebar={<AppSidebar />}
      isManagedSidebar
      skipToContent={
        <SkipToContent
          onClick={handleSkipToContent}
          href={`#${MAIN_CONTENT_ID}`}
        >
          Skip to content
        </SkipToContent>
      }
      mainContainerId={MAIN_CONTENT_ID}
      groupProps={{ stickyOnBreakpoint: { default: "top" } }}
    >
      <ScrollToTop />
      <CommandPaletteProvider />
      <ErrorBoundary resetKeys={[pathname]}>
        <Suspense fallback={<Bullseye><Spinner size="xl" /></Bullseye>}>
          <Routes>
            {routes.flatMap((r) =>
              "children" in r
                ? r.children.map((c) => <Route key={c.path} path={c.path} element={<c.page />} />)
                : [<Route key={r.path} path={r.path} element={<r.page />} />]
            )}
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Page>
  );
};
