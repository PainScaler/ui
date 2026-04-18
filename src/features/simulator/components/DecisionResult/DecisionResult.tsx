import type { simulator } from "@/shared/api/models.gen";
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  Content,
  ContentVariants,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
  BellIcon,
} from "@patternfly/react-icons";
import { useState } from "react";

// -- Helpers ------------------------------------------------------------------

type ActionStatus = "success" | "danger" | "warning" | "info" | "custom";

function actionStatus(action?: string): ActionStatus {
  switch (action?.toUpperCase()) {
    case "ALLOW":
      return "success";
    case "DENY":
      return "danger";
    case "ISOLATE":
      return "warning";
    case "BYPASS":
      return "info";
    default:
      return "info";
  }
}

const statusIcons = {
  success: <CheckCircleIcon />,
  warning: <ExclamationTriangleIcon />,
  danger: <ExclamationCircleIcon />,
  info: <InfoCircleIcon />,
  custom: <BellIcon />,
};

/** Colour-coded badge for an action string (ALLOW / DENY / ISOLATE / BYPASS). */
function ActionBadge({
  action,
  matched = false,
}: {
  action?: string;
  matched?: boolean;
}) {
  if (!action) return null;
  return (
    <Label
      variant="outline"
      status={matched ? actionStatus(action) : undefined}
      icon={!matched ? statusIcons[actionStatus(action)] : undefined}
      style={
        !matched
          ? {
              opacity: "0.5",
            }
          : undefined
      }
    >
      <strong>{action.toUpperCase()}</strong>
    </Label>
  );
}

// -- Props --------------------------------------------------------------------

interface Props {
  result: simulator.DecisionResult;
  context: simulator.SimContext;
}

// -----------------------------------------------------------------------------

/**
 * `DecisionResultText` renders a `simulator.DecisionResult` as structured,
 * human-readable text -- ideal for quick debugging and copy-paste into tickets.
 * Prefer this view when the user needs to read exact field values, inspect
 * condition logic, or work in a low-bandwidth / accessibility context.
 */
export function DecisionResultText({ result, context }: Props) {
  return (
    <Stack hasGutter>
      <StackItem>
        <TopSection result={result} context={context} />
      </StackItem>

      {result.warnings && result.warnings.length > 0 && (
        <StackItem>
          <WarningsBlock warnings={result.warnings} />
        </StackItem>
      )}

      {result.trace && result.trace.length > 0 && (
        <StackItem>
          <TraceList trace={result.trace} />
        </StackItem>
      )}
    </Stack>
  );
}

// -- Top section: decision + matched rule --------------------------------------

function TopSection({
  result,
}: {
  result: simulator.DecisionResult;
  context: simulator.SimContext;
}) {
  const rule = result.matched_rule;
  return (
    // DescriptionList is the correct PF component for label -> value pairs.
    // isHorizontal renders term and description side by side.
    <DescriptionList isHorizontal columnModifier={{ default: "2Col" }}>
      <DescriptionListGroup>
        <DescriptionListTerm>Decision</DescriptionListTerm>
        <DescriptionListDescription>
          <ActionBadge action={result.action} matched={true} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {rule && (
        <DescriptionListGroup>
          <DescriptionListTerm>Matched rule</DescriptionListTerm>
          <DescriptionListDescription>
            {rule.name ?? rule.id ?? "-"}
            {rule.priority != null && (
              <Content
                component={ContentVariants.small}
                style={{
                  marginLeft: "0.4em",
                  color: "var(--pf-t--global--text--color--subtle)",
                }}
              >
                (priority {rule.priority})
              </Content>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
}

// -- Warnings -----------------------------------------------------------------

function WarningsBlock({ warnings }: { warnings: string[] }) {
  // PF Alert with variant="warning" replaces the bespoke amber div.
  return (
    <Alert
      variant="warning"
      isInline
      title={`${warnings.length} warning${warnings.length !== 1 ? "s" : ""}`}
    >
      <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
        {warnings.map((w, i) => (
          // eslint-disable-next-line react-x/no-array-index-key -- warnings may repeat; index tiebreaker is intentional
          <li key={`${i}-${w}`}>{w}</li>
        ))}
      </ul>
    </Alert>
  );
}

// -- Trace list ---------------------------------------------------------------

function TraceList({ trace }: { trace: simulator.RuleTrace[] }) {
  return (
    <Stack hasGutter>
      <StackItem>
        <Content component={ContentVariants.h3}>Rule evaluation trace</Content>
      </StackItem>
      <DataList aria-label="Rule Trace">
        {trace.map((rt, i) => (
          <RuleTraceRow key={rt.rule_id ?? `trace-${i}`} rule={rt} index={i} />
        ))}
      </DataList>
    </Stack>
  );
}

// -- Rule trace row -----------------------------------------------------------

function RuleTraceRow({
  rule,
  index,
}: {
  rule: simulator.RuleTrace;
  index: number;
}) {
  const hasConditions = Boolean(rule.conditions?.length);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DataListItem
      aria-labelledby={`rule-trace-row-${index}`}
      isExpanded={isOpen}
    >
      <DataListItemRow>
        <DataListToggle
          id={`m-ex-toggle-${index}`}
          aria-controls={`m-ex-expand-${index}`}
          isExpanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        />
        <DataListItemCells
          dataListCells={[
            <DataListCell isFilled={false} key="secondary content fill">
              <span id={`rule-index-${index}`}>#{index + 1}</span>
            </DataListCell>,
            <DataListCell key="primary-content">
              <Content
                component={ContentVariants.p}
                style={{
                  fontWeight: "var(--pf-t--global--font--weight--body--bold)",
                  margin: 0,
                }}
              >
                {rule.rule_name ?? rule.rule_id ?? "Unnamed rule"}
              </Content>
            </DataListCell>,
            <DataListCell
              isFilled={false}
              alignRight
              key={`secondary-content-${index}`}
            >
              <Grid hasGutter style={{ alignItems: "center" }}>
                {rule.action && (
                  <GridItem>
                    <ActionBadge action={rule.action} matched={rule.matched} />
                  </GridItem>
                )}
              </Grid>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>

      {(rule.skip_reason ?? hasConditions) && (
        <DataListContent
          aria-label="Third mixed expandable content details"
          id={`m-ex-expand-${index}`}
          isHidden={!isOpen}
        >
          <Stack hasGutter>
            {rule.skip_reason && (
              <StackItem>
                <Content
                  component={ContentVariants.small}
                  style={{ color: "var(--pf-t--global--text--color--subtle)" }}
                >
                  Skip reason: {rule.skip_reason}
                </Content>
              </StackItem>
            )}

            {isOpen && hasConditions && (
              <StackItem>
                <Stack hasGutter>
                  {rule.conditions!.map((c, ci) => (
                    <StackItem key={c.condition_id ?? ci}>
                      <ConditionRow condition={c} index={ci} />
                    </StackItem>
                  ))}
                </Stack>
              </StackItem>
            )}
          </Stack>
        </DataListContent>
      )}
    </DataListItem>
  );
}

// -- Condition row ------------------------------------------------------------

function ConditionRow({
  condition,
  index,
}: {
  condition: simulator.ConditionResult;
  index: number;
}) {
  return (
    <Card isCompact>
      <CardHeader>
        <Grid hasGutter style={{ alignItems: "center" }}>
          <GridItem>
            <Content
              component={ContentVariants.small}
              style={{ color: "var(--pf-t--global--text--color--subtle)" }}
            >
              Condition {index + 1}
            </Content>
          </GridItem>

          {condition.operator && (
            <GridItem>
              <Label variant="outline">{condition.operator}</Label>
            </GridItem>
          )}

          {condition.negated && (
            <GridItem>
              <Label color="red" variant="outline">
                NEGATED
              </Label>
            </GridItem>
          )}

          <GridItem>
            <Label
              variant="outline"
              status={condition.result ? "success" : "danger"}
            >
              {condition.result ? "true" : "false"}
            </Label>
          </GridItem>
        </Grid>
      </CardHeader>

      {condition.operands && condition.operands.length > 0 && (
        <CardBody>
          {/* Semantic table for structured operand data.
              Colours use PF design tokens, no hardcoded hex. */}
          <table
            style={{
              borderCollapse: "collapse",
              fontSize: "var(--pf-t--global--font--size--sm)",
              width: "100%",
            }}
          >
            <thead>
              <tr style={{ color: "var(--pf-t--global--text--color--subtle)" }}>
                <th style={thStyle}>Object type</th>
                <th style={thStyle}>Matched</th>
                <th style={thStyle}>Skipped</th>
                <th style={thStyle}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {condition.operands.map((op, oi) => (
                <tr
                  // eslint-disable-next-line react-x/no-array-index-key -- operands lack unique id; index tiebreaker is intentional
                  key={`${op.object_type ?? "op"}-${op.match_reason ?? ""}-${oi}`}
                  style={{
                    borderTop:
                      "1px solid var(--pf-t--global--border--color--default)",
                  }}
                >
                  <td style={tdStyle}>{op.object_type ?? "-"}</td>
                  <td style={tdStyle}>
                    <Label
                      isCompact
                      variant="outline"
                      status={
                        op.matched == null
                          ? undefined
                          : op.matched
                            ? "success"
                            : "danger"
                      }
                    >
                      {op.matched == null ? "-" : op.matched ? "yes" : "no"}
                    </Label>
                  </td>
                  <td style={tdStyle}>
                    <Label
                      isCompact
                      variant="outline"
                      status={
                        op.skipped == null
                          ? undefined
                          : op.skipped
                            ? "warning"
                            : undefined
                      }
                    >
                      {op.skipped == null ? "-" : op.skipped ? "yes" : "no"}
                    </Label>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: "var(--pf-t--global--text--color--regular)",
                    }}
                  >
                    {op.match_reason ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      )}
    </Card>
  );
}

// -- Table cell styles (structural only, no hardcoded colours) ----------------

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "2px 6px",
  fontWeight: 500,
};

const tdStyle: React.CSSProperties = {
  padding: "2px 6px",
  verticalAlign: "top",
};
