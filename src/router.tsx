import { lazy } from "react";

const OverviewPage = lazy(() => import("./pages/OverviewPage").then((m) => ({ default: m.OverviewPage })));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage").then((m) => ({ default: m.ApplicationsPage })));
const AppGroupsPage = lazy(() => import("./pages/AppGroupsPage").then((m) => ({ default: m.AppGroupsPage })));
const AppConnectorsPage = lazy(() => import("./pages/AppConnectorsPage").then((m) => ({ default: m.AppConnectorsPage })));
const AppConnectorGroupsPage = lazy(() => import("./pages/AppConnectorGroupsPage").then((m) => ({ default: m.AppConnectorGroupsPage })));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage").then((m) => ({ default: m.PoliciesPage })));
const ServerGroupsPage = lazy(() => import("./pages/ServerGroupsPage").then((m) => ({ default: m.ServerGroupsPage })));
const ScimGroupsPage = lazy(() => import("./pages/ScimGroupsPage").then((m) => ({ default: m.ScimGroupsPage })));
const TrustedNetworksPage = lazy(() => import("./pages/TrustedNetworksPage").then((m) => ({ default: m.TrustedNetworksPage })));
const PostureProfilesPage = lazy(() => import("./pages/PostureProfilesPage").then((m) => ({ default: m.PostureProfilesPage })));
const SimulationPage = lazy(() => import("./pages/SimulationPage").then((m) => ({ default: m.SimulationPage })));
const ScimAttributesPage = lazy(() => import("./pages/ScimAttributes").then((m) => ({ default: m.ScimAttributesPage })));
const QueriesPage = lazy(() => import("./pages/QueriesPage").then((m) => ({ default: m.QueriesPage })));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage").then((m) => ({ default: m.CertificatesPage })));
const FlowGraphPage = lazy(() => import("@/features/flow-graph/FlowGraphPage").then((m) => ({ default: m.FlowGraphPage })));
const RoutesPage = lazy(() => import("./pages/RoutesPage").then((m) => ({ default: m.RoutesPage })));

export interface Route {
  path: string;
  label: string;
  page: React.ComponentType;
}

export interface RouteGroup {
  path: string;
  label: string;
  children: Route[]
}
export const routes: (Route|RouteGroup)[] = [
  { path: "/overview", label: "Overview", page: OverviewPage },

  { path: "/applications", label: "Applications", children: [
    { path: "/segments", label: "Segments", page: ApplicationsPage },
    { path: "/segment-groups", label: "Segment Groups", page: AppGroupsPage },
    { path: "/server-groups", label: "Server Groups", page: ServerGroupsPage },
    { path: "/app-connectors", label: "App Connectors", page: AppConnectorsPage },
    { path: "/app-connector-groups", label: "App Connector Groups", page: AppConnectorGroupsPage },
  ]},

  { path: "/access", label: "Access Control", children: [
    { path: "/policies", label: "Policies", page: PoliciesPage },
    { path: "/scim-groups", label: "SCIM Groups", page: ScimGroupsPage },
    { path: "/attributes", label: "SCIM Attributes", page: ScimAttributesPage },
  ]},

  { path: "/network", label: "Network & Devices", children: [
    { path: "/trusted-networks", label: "Trusted Networks", page: TrustedNetworksPage },
    { path: "/posture-profiles", label: "Posture Profiles", page: PostureProfilesPage },
    { path:"/certificates",      label: "Certificates",     page: CertificatesPage}
  ]},
  { path: "/premium", label: "Insights", children: [
      { path: "/simulator", label: "Simulator", page: SimulationPage },
      { path: "/flow", label: "Flow", page: FlowGraphPage },
      { path: "/routes", label: "Routes", page: RoutesPage },
    ]
  },
  { path: "/queries", label: "Queries", page: QueriesPage },
  { path: "/analytics", label: "Analytics", page: AnalyticsPage },
];
