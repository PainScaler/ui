import { useQuery } from "@tanstack/react-query";
import {
  GetAccessPolicies,
  GetAppConnectorGroups,
  GetAppConnectors,
  GetCertificates,
  GetClientTypes,
  GetIdpControllers,
  GetPlatforms,
  GetPostureProfiles,
  GetScimAttributeHeaders,
  GetScimGroups,
  GetSegmentGroups,
  GetSegments,
  GetServerGroups,
  GetTrustedNetworks,
  GetIndex,
  GetOrphans,
  GetOverlaps,
  GetPolicyShadows,
  GetOrphanClusters,
  GetDomainOverlaps,
  GetConnectorLoad,
  GetScimReach,
  GetFlowGraph,
  GetRoutes,
} from "@/shared/api/api.gen";
import type { analysis } from "@/shared/api/models.gen";
import { qk } from "@/shared/api/queryKeys";

export const useSegments             = () => useQuery({ queryKey: qk.segments,             queryFn: GetSegments });
export const useSegmentGroups        = () => useQuery({ queryKey: qk.segmentGroups,        queryFn: GetSegmentGroups });
export const useServerGroups         = () => useQuery({ queryKey: qk.serverGroups,         queryFn: GetServerGroups });
export const useAccessPolicies       = () => useQuery({ queryKey: qk.accessPolicies,       queryFn: GetAccessPolicies });
export const useAppConnectors        = () => useQuery({ queryKey: qk.appConnectors,        queryFn: GetAppConnectors });
export const useAppConnectorGroups   = () => useQuery({ queryKey: qk.appConnectorGroups,   queryFn: GetAppConnectorGroups });
export const useScimGroups           = () => useQuery({ queryKey: qk.scimGroups,           queryFn: GetScimGroups });
export const useScimAttributeHeaders = () => useQuery({ queryKey: qk.scimAttributeHeaders, queryFn: GetScimAttributeHeaders });
export const usePostureProfiles      = () => useQuery({ queryKey: qk.postureProfiles,      queryFn: GetPostureProfiles });
export const useTrustedNetworks      = () => useQuery({ queryKey: qk.trustedNetworks,      queryFn: GetTrustedNetworks });
export const useCertificates         = () => useQuery({ queryKey: qk.certificates,         queryFn: GetCertificates });
export const useClientTypes          = () => useQuery({ queryKey: qk.clientTypes,          queryFn: GetClientTypes });
export const usePlatforms            = () => useQuery({ queryKey: qk.platforms,            queryFn: GetPlatforms });
export const useIdpControllers       = () => useQuery({ queryKey: qk.idpControllers,       queryFn: GetIdpControllers });
export const useIndex                = () => useQuery({ queryKey: qk.index,                queryFn: GetIndex });
export const useOrphans              = () => useQuery({ queryKey: qk.orphans,              queryFn: GetOrphans });
export const useOverlaps             = () => useQuery({ queryKey: qk.overlaps,             queryFn: GetOverlaps });
export const usePolicyShadows        = () => useQuery({ queryKey: qk.policyShadows,        queryFn: GetPolicyShadows });
export const useOrphanClusters       = () => useQuery({ queryKey: qk.orphanClusters,       queryFn: GetOrphanClusters });
export const useDomainOverlaps       = () => useQuery({ queryKey: qk.domainOverlaps,       queryFn: GetDomainOverlaps });
export const useConnectorLoad        = () => useQuery({ queryKey: qk.connectorLoad,        queryFn: GetConnectorLoad });
export const useScimReach            = () => useQuery({ queryKey: qk.scimReach,            queryFn: GetScimReach });
export const useRoutes               = () => useQuery({ queryKey: qk.routes,               queryFn: GetRoutes });
export const useFlowGraph            = (body: analysis.GraphQueryBody) =>
  useQuery({ queryKey: qk.flowGraph(body), queryFn: () => GetFlowGraph(body) });
