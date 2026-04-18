import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Form,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { CompareSimulation } from "@/shared/api/api.gen";
import { simulator, server } from "@/shared/api/models.gen";
import { useIndex, usePlatforms, useTrustedNetworks } from "@/shared/api/queries";
import { AccessTargetSection } from "@/features/simulator/components/AccessTargetSection";
import { ClientContextSection } from "@/features/simulator/components/ClientContextSection";
import { UserIdentitySection } from "@/features/simulator/components/UserIdentitySection";
import {
  DEFAULT_FORM,
  validateAccessTarget,
  validateClientContext,
} from "@/features/simulator/components/types";
import type { FormState } from "@/features/simulator/components/types";
import { DecisionResultText } from "@/features/simulator/components/DecisionResult/DecisionResult";
import {
  DEFAULT_VIRTUAL_POLICY,
  VirtualPolicyForm,
  isVirtualPolicyValid,
} from "@/features/simulator/components/VirtualPolicyForm";
import type { VirtualPolicyState } from "@/features/simulator/components/VirtualPolicyForm";

function toSimContext(form: FormState): simulator.SimContext {
  const attrs: Record<string, string> = {};
  for (const { attr, value } of form.scimAttrs) {
    if (attr) attrs[attr] = value;
  }
  return new simulator.SimContext({
    scim_group_ids: form.scimGroupIDs,
    scim_attrs: attrs,
    segment_id: form.segmentID,
    segment_group_id: form.segmentGroupID,
    client_type: "zpn_client_type_zapp",
    trusted_network: form.trustedNetwork,
    platform: form.platform,
    fqdn: form.fqdn,
  });
}

function diffBadge(
  baseline?: simulator.DecisionResult,
  overlay?: simulator.DecisionResult,
) {
  if (!baseline || !overlay) return null;
  if (baseline.action === overlay.action) {
    const sameRule =
      (baseline.matched_rule?.id ?? "") === (overlay.matched_rule?.id ?? "");
    return sameRule ? (
      <Label color="grey">unchanged</Label>
    ) : (
      <Label color="orange">matched rule changed</Label>
    );
  }
  const color = overlay.action === "ALLOW" ? "green" : "red";
  return (
    <Label color={color}>
      {baseline.action ?? "?"} → {overlay.action ?? "?"}
    </Label>
  );
}

export function VirtualPolicyView() {
  const { data: index, error: indexError } = useIndex();
  const { data: trustedNetworksRaw, error: tnError } = useTrustedNetworks();
  const { data: platforms, error: platformsError } = usePlatforms();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [policy, setPolicy] = useState<VirtualPolicyState>(DEFAULT_VIRTUAL_POLICY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<server.CompareResult | null>(null);

  const loadError = indexError ?? tnError ?? platformsError;

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const segmentGroups = useMemo(
    () =>
      Object.values(index?.SegmentGroups ?? {}).map((g) => ({
        id: g.id ?? "",
        label: g.name ?? g.id ?? "",
      })),
    [index],
  );
  const segments = useMemo(
    () =>
      Object.values(index?.Segments ?? {}).map((s) => ({
        id: s.id ?? "",
        label: s.name ?? s.id ?? "",
        groupId: s.segmentGroupId ?? "",
      })),
    [index],
  );
  const filteredSegments = useMemo(
    () =>
      form.segmentGroupID
        ? segments.filter((s) => s.groupId === form.segmentGroupID)
        : segments,
    [segments, form.segmentGroupID],
  );
  const allGroups = useMemo(
    () =>
      Object.values(index?.ScimGroups ?? {}).map((g) => ({
        id: String(g.id ?? ""),
        label: g.name ?? String(g.id),
      })),
    [index],
  );
  const trustedNetworks = useMemo(
    () =>
      (trustedNetworksRaw ?? []).map((n) => ({
        id: n.name ?? "",
        label: n.name ?? "",
      })),
    [trustedNetworksRaw],
  );
  const scimAttrNames = useMemo(
    () => Object.keys(index?.ScimAttrNameToID ?? {}),
    [index],
  );
  const fqdnSuggestions = useMemo(
    () => Object.keys(index?.DomainToSegments ?? {}),
    [index],
  );

  function handleSegmentGroupChange(id: string) {
    setForm((f) => ({
      ...f,
      segmentGroupID: id,
      segmentID:
        f.segmentID && index?.Segments[f.segmentID]?.segmentGroupId !== id
          ? ""
          : f.segmentID,
    }));
  }
  function handleSegmentChange(id: string) {
    const groupId = id ? (index?.Segments[id]?.segmentGroupId ?? "") : "";
    setForm((f) => ({
      ...f,
      segmentID: id,
      segmentGroupID: groupId || f.segmentGroupID,
    }));
  }
  function addAttr() {
    setForm((f) => ({
      ...f,
      scimAttrs: [...f.scimAttrs, { id: crypto.randomUUID(), attr: "", value: "" }],
    }));
  }
  function updateAttr(i: number, field: "attr" | "value", val: string) {
    setForm((f) => ({
      ...f,
      scimAttrs: f.scimAttrs.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)),
    }));
  }
  function removeAttr(i: number) {
    setForm((f) => ({
      ...f,
      scimAttrs: f.scimAttrs.filter((_, idx) => idx !== i),
    }));
  }

  const contextErrors = [
    ...validateAccessTarget(form),
    ...validateClientContext(form),
  ];
  const canRun =
    !submitting && contextErrors.length === 0 && isVirtualPolicyValid(policy);

  async function handleRun() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await CompareSimulation(
        new server.CompareRequest({
          context: toSimContext(form),
          virtualPolicy: new server.VirtualPolicyInput({
            name: policy.name,
            action: policy.action,
            priority: policy.priority,
            scimGroupIds: policy.scimGroupIds,
            segmentIds: policy.segmentIds,
            segmentGroupIds: policy.segmentGroupIds,
          }),
        }),
      );
      setResult(res);
    } catch (err) {
      setSubmitError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <Stack hasGutter>
        {loadError && (
          <StackItem>
            <Alert variant="danger" isInline title={loadError.name} />
          </StackItem>
        )}

        <StackItem>
          <VirtualPolicyForm
            value={policy}
            onChange={(patch) => setPolicy((p) => ({ ...p, ...patch }))}
            scimGroups={allGroups}
            segments={segments}
            segmentGroups={segmentGroups}
          />
        </StackItem>

        <StackItem>
          <Card>
            <CardHeader>
              <CardTitle>Simulation Context</CardTitle>
            </CardHeader>
            <CardBody>
              <Form>
                <AccessTargetSection
                  fqdn={form.fqdn}
                  fqdnSuggestions={fqdnSuggestions}
                  onFqdnChange={(v) => set("fqdn", v)}
                  segmentGroupID={form.segmentGroupID}
                  segmentGroups={segmentGroups}
                  onSegmentGroupChange={handleSegmentGroupChange}
                  segmentID={form.segmentID}
                  segments={filteredSegments}
                  onSegmentChange={handleSegmentChange}
                />
                <UserIdentitySection
                  allGroups={allGroups}
                  onGroupsChange={(ids) => set("scimGroupIDs", ids)}
                  scimAttrs={form.scimAttrs}
                  scimAttrNames={scimAttrNames}
                  onAddAttr={addAttr}
                  onUpdateAttr={updateAttr}
                  onRemoveAttr={removeAttr}
                />
                <ClientContextSection
                  platform={form.platform}
                  platforms={platforms ?? []}
                  onPlatformChange={(v) => set("platform", v)}
                  trustedNetwork={form.trustedNetwork}
                  trustedNetworks={trustedNetworks}
                  onTrustedNetworkChange={(v) => set("trustedNetwork", v)}
                />
              </Form>
            </CardBody>
          </Card>
        </StackItem>

        <StackItem>
          <Flex spaceItems={{ default: "spaceItemsMd" }} alignItems={{ default: "alignItemsCenter" }}>
            <FlexItem>
              <Button
                variant="primary"
                isDisabled={!canRun}
                isLoading={submitting}
                onClick={() => void handleRun()}
              >
                Run comparison
              </Button>
            </FlexItem>
            {contextErrors.length > 0 && (
              <FlexItem>
                <Alert variant="warning" isInline isPlain title={contextErrors[0]} />
              </FlexItem>
            )}
          </Flex>
        </StackItem>

        {submitError && (
          <StackItem>
            <Alert variant="danger" isInline title={submitError} />
          </StackItem>
        )}

        {result && (
          <StackItem>
            <Card>
              <CardHeader>
                <Flex spaceItems={{ default: "spaceItemsSm" }} alignItems={{ default: "alignItemsCenter" }}>
                  <FlexItem>
                    <CardTitle>Comparison</CardTitle>
                  </FlexItem>
                  <FlexItem>{diffBadge(result.baseline, result.withVirtual)}</FlexItem>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid hasGutter>
                  <GridItem md={6}>
                    <Card isPlain>
                      <CardHeader>
                        <CardTitle>Baseline</CardTitle>
                      </CardHeader>
                      <CardBody>
                        {result.baseline && (
                          <DecisionResultText
                            result={result.baseline}
                            context={toSimContext(form)}
                          />
                        )}
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem md={6}>
                    <Card isPlain>
                      <CardHeader>
                        <CardTitle>With Virtual Policy</CardTitle>
                      </CardHeader>
                      <CardBody>
                        {result.withVirtual && (
                          <DecisionResultText
                            result={result.withVirtual}
                            context={toSimContext(form)}
                          />
                        )}
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          </StackItem>
        )}
      </Stack>
    </div>
  );
}
