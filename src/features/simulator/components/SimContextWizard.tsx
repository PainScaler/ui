import { useMemo, useState } from "react";
import {
  Alert,
  Form,
  Wizard,
  WizardBody,
  WizardFooter,
  WizardStep,
  useWizardContext,
} from "@patternfly/react-core";
import { simulator } from "@/shared/api/models.gen";
import { AccessTargetSection } from "./AccessTargetSection";
import { ClientContextSection } from "./ClientContextSection";
import { UserIdentitySection } from "./UserIdentitySection";
import { SimContextSummary } from "./SimContextSummary";
import {
  DEFAULT_FORM,
  validateAccessTarget,
  validateClientContext,
} from "./types";
import type { FormState, StepError } from "./types";
import { resetScroll } from "@/shared/lib/scroll";
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

// -- Validated footer (renders inside Wizard context) ------------------------

function ValidatedStepFooter({
  validate,
  form,
  stepId,
  onErrors,
}: {
  validate: (f: FormState) => StepError[];
  form: FormState;
  stepId: string;
  onErrors: (stepId: string, errs: StepError[]) => void;
}) {
  const { goToNextStep, goToPrevStep, activeStep, steps } = useWizardContext();
  const isFirst = activeStep.id === steps[0]?.id;

  return (
    <WizardFooter
      activeStep={activeStep}
      onNext={() => {
        const errs = validate(form);
        if (errs.length > 0) {
          onErrors(stepId, errs);
          return;
        }
        onErrors(stepId, []);
        goToNextStep();
      }}
      onBack={() => goToPrevStep()}
      onClose={() => {}}
      isBackHidden={isFirst}
    />
  );
}

function SubmitFooter({
  onSubmit,
  submitting,
}: {
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { goToPrevStep, activeStep } = useWizardContext();

  return (
    <WizardFooter
      activeStep={activeStep}
      onNext={onSubmit}
      onBack={() => goToPrevStep()}
      onClose={() => {}}
      nextButtonText="Run Simulation"
      isNextDisabled={submitting}
    />
  );
}

// -- The wizard --------------------------------------------------------------

interface Props {
  onRun: (ctx: simulator.SimContext) => Promise<void>;
}

export function SimContextWizard({ onRun }: Props) {
  const { data: index, error: indexError } = useIndex();
  const {data: trustedNetworksRaw, error: tnError } = useTrustedNetworks();
  const {data: platforms, error: platformsError } = usePlatforms();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, StepError[]>>({});
  const [stepStatuses, setStepStatuses] = useState<Record<string, "default" | "error">>({});

  const loadError = indexError ?? tnError ?? platformsError;

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setStepErrors({});
    setStepStatuses({});
  }

  const handleErrors = (stepId: string, errs: StepError[]) => {
    setStepErrors((prev) => ({ ...prev, [stepId]: errs }));
    setStepStatuses((prev) => ({
      ...prev,
      [stepId]: errs.length > 0 ? "error" : "default",
    }));
  };

  // -- Derived options --

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
    resetScroll();
    setStepErrors({});
    setStepStatuses({});
  }

  function handleSegmentChange(id: string) {
    const groupId = id ? (index?.Segments[id]?.segmentGroupId ?? "") : "";
    setForm((f) => ({
      ...f,
      segmentID: id,
      segmentGroupID: groupId || f.segmentGroupID,
    }));
    resetScroll();
    setStepErrors({});
    setStepStatuses({});
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

  async function handleSubmit() {
    resetScroll();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onRun(toSimContext(form));
    } catch (err) {
      setSubmitError(String(err));
      setSubmitting(false);
    }
  }

  return (
    <>
      {loadError && <Alert variant="danger" isInline title={loadError.name} />}
      <Wizard isVisitRequired shouldFocusContent>
        <WizardStep
          name="Access Target"
          id="step-target"
          status={stepStatuses["step-target"] ?? "default"}
          footer={
            <ValidatedStepFooter
              validate={validateAccessTarget}
              form={form}
              stepId="step-target"
              onErrors={handleErrors}
            />
          }
        >
          <WizardBody hasNoPadding>
          <Form>
            {(stepErrors["step-target"] ?? []).map((e) => (
              <Alert key={e} variant="danger" isInline isPlain title={e} />
            ))}
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
          </Form>
          </WizardBody>
        </WizardStep>

        <WizardStep name="User Identity" id="step-identity">
          <WizardBody hasNoPadding>
          <Form>
            <UserIdentitySection
              allGroups={allGroups}
              onGroupsChange={(ids) => set("scimGroupIDs", ids)}
              scimAttrs={form.scimAttrs}
              scimAttrNames={scimAttrNames}
              onAddAttr={addAttr}
              onUpdateAttr={updateAttr}
              onRemoveAttr={removeAttr}
            />
          </Form>
          </WizardBody>
        </WizardStep>

        <WizardStep
          name="Client Context"
          id="step-client"
          status={stepStatuses["step-client"] ?? "default"}
          footer={
            <ValidatedStepFooter
              validate={validateClientContext}
              form={form}
              stepId="step-client"
              onErrors={handleErrors}
            />
          }
        >
          <WizardBody hasNoPadding>
          <Form>
            {(stepErrors["step-client"] ?? []).map((e) => (
              <Alert key={e} variant="danger" isInline isPlain title={e} />
            ))}
            <ClientContextSection
              platform={form.platform}
              platforms={platforms ?? []}
              onPlatformChange={(v) => set("platform", v)}
              trustedNetwork={form.trustedNetwork}
              trustedNetworks={trustedNetworks}
              onTrustedNetworkChange={(v) => set("trustedNetwork", v)}
            />
          </Form>
          </WizardBody>
        </WizardStep>

        <WizardStep
          name="Review & Submit"
          id="step-review"
          footer={
            <SubmitFooter onSubmit={handleSubmit} submitting={submitting} />
          }
        >
          <WizardBody hasNoPadding>
          {submitError && <Alert variant="danger" isInline title={submitError} />}
          <SimContextSummary
            form={form}
            segmentGroups={segmentGroups}
            segments={segments}
            allGroups={allGroups}
            trustedNetworks={trustedNetworks}
            fqdnSuggestions={fqdnSuggestions}
          />
          </WizardBody>
        </WizardStep>
      </Wizard>
    </>
  );
}
