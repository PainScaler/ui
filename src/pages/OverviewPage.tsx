import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  Title,
} from "@patternfly/react-core";
import {
  useSegments,
  useAccessPolicies,
  useSegmentGroups,
  useServerGroups,
  useScimGroups,
  useTrustedNetworks,
  usePostureProfiles,
  useIndex,
} from "@/shared/api/queries";
import {
  applicationsegment,
  index,
  policysetcontrollerv2,
  segmentgroup,
  servergroup,
  scimgroup,
  trustednetwork,
  postureprofile,
} from "@/shared/api/models.gen";

interface MetricCard {
  label: string;
  value: number;
  detail: string | null;
  warn?: boolean;
  onClick?: () => void;
}

function getCards(
  segments: applicationsegment.ApplicationSegmentResource[],
  accessPolicies: policysetcontrollerv2.PolicyRuleResource[],
  segmentGroups: segmentgroup.SegmentGroup[],
  serverGroups: servergroup.ServerGroup[],
  scimGroups: scimgroup.ScimGroup[],
  trustedNetworks: trustednetwork.TrustedNetwork[],
  postureProfiles: postureprofile.PostureProfile[],
  index: index.Index,
): MetricCard[] {
  return [
    {
      label: "App Segments",
      value: segments.length,
      detail: `${segments.filter((s) => s.enabled).length} enabled`,
    },
    {
      label: "Access Policies",
      value: accessPolicies.length,
      detail: `${accessPolicies.filter((p) => p.action === "ALLOW").length} allow / ${accessPolicies.filter((p) => p.action === "DENY").length} deny`,
    },
    {
      label: "Segment Groups",
      value: segmentGroups.length,
      detail: null,
    },
    {
      label: "Server Groups",
      value: serverGroups.length,
      detail: null,
    },
    {
      label: "SCIM Groups",
      value: scimGroups.length,
      detail: null,
    },
    {
      label: "Trusted Networks",
      value: trustedNetworks.length,
      detail: null,
    },
    {
      label: "Posture Profiles",
      value: postureProfiles.length,
      detail: null,
    },
    {
      label: "Orphan Segments",
      value: index.OrphanSegments?.length ?? 0,
      detail: "enabled, no policy",
      warn: (index.OrphanSegments?.length ?? 0) > 0,
    },
    {
      label: "Disabled Segments",
      value: index.DisabledSegments.length,
      detail: null,
    },
    {
      label: "Domain Overlaps",
      value: Object.keys(index.OverlappingDomains).length,
      detail: "same domain in 2+ segments",
      warn: Object.keys(index.OverlappingDomains).length > 0,
    },
  ];
}

const warnColor = "var(--pf-t--global--color--status--warning--default)";
const subtleColor = "var(--pf-t--global--color--nonstatus--gray--default)";

export function OverviewPage() {
  const { data: segments = [] } = useSegments();
  const { data: accessPolicies = [] } = useAccessPolicies();
  const { data: segmentGroups = [] } = useSegmentGroups();
  const { data: serverGroups = [] } = useServerGroups();
  const { data: scimGroups = [] } = useScimGroups();
  const { data: trustedNetworks = [] } = useTrustedNetworks();
  const { data: postureProfiles = [] } = usePostureProfiles();
  const { data: index } = useIndex();

  return (
    <PageSection aria-label="Overview">
      {index && (
        <Grid hasGutter>
          {getCards(
            segments,
            accessPolicies,
            segmentGroups,
            serverGroups,
            scimGroups,
            trustedNetworks,
            postureProfiles,
            index,
          ).map((c) => (
            <GridItem key={c.label} span={4}>
              <Card isFullHeight>
                <CardTitle>
                  <small style={{ color: c.warn ? warnColor : subtleColor }}>
                    {c.label}
                  </small>
                </CardTitle>
                <CardBody>
                  <Title
                    headingLevel="h2"
                    size="3xl"
                    style={{ color: c.warn ? warnColor : undefined }}
                  >
                    {c.value}
                  </Title>
                  {c.detail && (
                    <small style={{ color: subtleColor }}>{c.detail}</small>
                  )}
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      )}
    </PageSection>
  );
}
