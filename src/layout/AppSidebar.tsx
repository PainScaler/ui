import { use, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageContext,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { routes, type RouteGroup } from "@/router";

export const AppSidebar: React.FunctionComponent = () => {
  const { isSidebarOpen, onSidebarToggle, width } = use(PageContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isGraphPage =
    location.pathname === "/model-graph" || location.pathname === "/flow";
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("pf-v6-theme-dark");

  // Track which groups the user has manually toggled.
  // Groups not in this map fall back to "expanded if a child is active".
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isGraphPage && isSidebarOpen) onSidebarToggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleSelect = (_event: unknown, selectedItem: { itemId: string | number }) => {
    if (typeof selectedItem.itemId === "string") {
      navigate(selectedItem.itemId);
      if (isSidebarOpen && width < 1200) {
        onSidebarToggle();
      }
    }
  };

  const isGroup = (r: (typeof routes)[number]): r is RouteGroup => "children" in r;

  return (
    <PageSidebar
      style={
        isGraphPage
          ? {
              borderRight:
                "1px solid var(--pf-t--global--border--color--default)",
              boxShadow: isDark
                ? "2px 0 8px rgba(0,0,0,0.25)"
                : "var(--pf-t--global--box-shadow--sm--right)",
            }
          : undefined
      }
    >
      <PageSidebarBody>
        <Nav onSelect={handleSelect}>
          <NavList>
            {routes.map((route) => {
              if (!isGroup(route)) {
                return (
                  <NavItem
                    key={route.path}
                    itemId={route.path}
                    isActive={location.pathname === route.path}
                  >
                    {route.label}
                  </NavItem>
                );
              }
              const childActive = route.children.some((c) => location.pathname === c.path);
              const isExpanded = expanded[route.path] ?? childActive;
              const isPremium = route.path === "/premium";
              return (
                <NavExpandable
                  key={route.path}
                  title={route.label}
                  isActive={childActive}
                  isExpanded={isExpanded}
                  className={isPremium ? "premium-nav" : undefined}
                  onExpand={(_e, val) =>
                    setExpanded((prev) => ({ ...prev, [route.path]: val }))
                  }
                >
                  {route.children.map((child) => (
                    <NavItem
                      key={child.path}
                      itemId={child.path}
                      isActive={location.pathname === child.path}
                      style={{
                        marginRight: 16
                      }}
                    >
                      {child.label}
                    </NavItem>
                  ))}
                </NavExpandable>
              );
            })}
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
};
