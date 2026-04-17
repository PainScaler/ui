import { useMemo, useState } from "react";
import { Alert, Button, Form } from "@patternfly/react-core";
import { RunSimulation } from "@/shared/api/api.gen";
import { simulator } from "@/shared/api/models.gen";
import { AccessTargetSection } from "./AccessTargetSection";
import { ClientContextSection } from "./ClientContextSection";
import { UserIdentitySection } from "./UserIdentitySection";
import { DEFAULT_FORM } from "./types";
import type { FormState } from "./types";
import { useIndex, usePlatforms, useTrustedNetworks } from "@/shared/api/queries";

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
export function SimContextForm() {
  const {data: index } = useIndex();
  const {data: trustedNetworksRaw } = useTrustedNetworks();
  const {data: platforms } = usePlatforms();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  function submitSimulation(ctx: simulator.SimContext) {
    setError(null);
    RunSimulation(ctx).catch((err) => setError(String(err)));
  }

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

  const segments = useMemo(() => {
    const all = Object.values(index?.Segments ?? {}).map((s) => ({
      id: s.id ?? "",
      label: s.name ?? s.id ?? "",
      groupId: s.segmentGroupId ?? "",
    }));
    return form.segmentGroupID
      ? all.filter((s) => s.groupId === form.segmentGroupID)
      : all;
  }, [index, form.segmentGroupID]);

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
      scimAttrs: f.scimAttrs.map((e, idx) =>
        idx === i ? { ...e, [field]: val } : e,
      ),
    }));
  }

  function removeAttr(i: number) {
    setForm((f) => ({
      ...f,
      scimAttrs: f.scimAttrs.filter((_, idx) => idx !== i),
    }));
  }

  return (
    <Form>
      {error && <Alert variant="danger" isInline title={error} />}
      <AccessTargetSection
        fqdn={form.fqdn}
        fqdnSuggestions={fqdnSuggestions}
        onFqdnChange={(v) => set("fqdn", v)}
        segmentGroupID={form.segmentGroupID}
        segmentGroups={segmentGroups}
        onSegmentGroupChange={handleSegmentGroupChange}
        segmentID={form.segmentID}
        segments={segments}
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
        platforms={platforms??[]}
        onPlatformChange={(v) => set("platform", v)}
        trustedNetwork={form.trustedNetwork}
        trustedNetworks={trustedNetworks}
        onTrustedNetworkChange={(v) => set("trustedNetwork", v)}
      />

      <div>
        <Button
          variant="primary"
          onClick={() => submitSimulation(toSimContext(form))}
        >
          Run Simulation
        </Button>
      </div>
    </Form>
  );
}
