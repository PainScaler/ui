import type { ModelNodeData } from "./ModelNode";
import type { Node } from "reactflow";
export const initialNodes: Node<ModelNodeData>[] = [
  // simulator
  { id: "SimContext",       type: "model", position: { x: 0, y: 0 }, data: { ns: "simulator", label: "SimContext",       fields: [{ name: "scim_group_ids", type: "string[]" }, { name: "scim_attrs", type: "map" }, { name: "segment_id", type: "string" }, { name: "client_type", type: "string" }, { name: "platform", type: "string" }, { name: "fqdn", type: "string" }] } },
  { id: "DecisionResult",   type: "model", position: { x: 0, y: 0 }, data: { ns: "simulator", label: "DecisionResult",   fields: [{ name: "action", type: "string" }, { name: "matched_rule", type: "PolicyRuleResource" }, { name: "trace", type: "RuleTrace[]" }, { name: "warnings", type: "string[]" }] } },
  { id: "RuleTrace",        type: "model", position: { x: 0, y: 0 }, data: { ns: "simulator", label: "RuleTrace",        fields: [{ name: "rule_id", type: "string" }, { name: "action", type: "string" }, { name: "matched", type: "bool" }, { name: "conditions", type: "ConditionResult[]" }] } },
  { id: "ConditionResult",  type: "model", position: { x: 0, y: 0 }, data: { ns: "simulator", label: "ConditionResult",  fields: [{ name: "operator", type: "string" }, { name: "negated", type: "bool" }, { name: "operands", type: "OperandResult[]" }, { name: "result", type: "bool" }] } },
  { id: "OperandResult",    type: "model", position: { x: 0, y: 0 }, data: { ns: "simulator", label: "OperandResult",    fields: [{ name: "object_type", type: "string" }, { name: "matched", type: "bool" }, { name: "skipped", type: "bool" }, { name: "match_reason", type: "string" }] } },

  // internal
  { id: "Snapshot",           type: "model", position: { x: 0, y: 0 }, data: { ns: "internal", label: "Snapshot",           fields: [{ name: "Segments", type: "[]" }, { name: "SegmentGroups", type: "[]" }, { name: "AccessPolicies", type: "[]" }, { name: "ScimGroups", type: "[]" }, { name: "TrustedNetworks", type: "[]" }] } },
  { id: "Index",              type: "model", position: { x: 0, y: 0 }, data: { ns: "internal", label: "Index",              fields: [{ name: "Segments", type: "map[id]" }, { name: "Policies", type: "map[id]" }, { name: "SegmentToPolicies", type: "map" }, { name: "DomainToSegments", type: "map" }, { name: "OrphanSegments", type: "[]" }] } },
  { id: "OrphanReport",       type: "model", position: { x: 0, y: 0 }, data: { ns: "internal", label: "OrphanReport",       fields: [{ name: "Segment", type: "ApplicationSegmentResource" }, { name: "Groups", type: "string[]" }] } },
  { id: "OverlapReport",      type: "model", position: { x: 0, y: 0 }, data: { ns: "internal", label: "OverlapReport",      fields: [{ name: "Domain", type: "string" }, { name: "Segments", type: "ApplicationSegmentResource[]" }] } },
  { id: "ReachabilityResult", type: "model", position: { x: 0, y: 0 }, data: { ns: "internal", label: "ReachabilityResult", fields: [{ name: "Domain", type: "string" }, { name: "Segments", type: "SegmentReachability[]" }] } },

  // policy
  { id: "PolicyRuleResource",           type: "model", position: { x: 0, y: 0 }, data: { ns: "policy", label: "PolicyRuleResource",           fields: [{ name: "id / name", type: "string" }, { name: "action", type: "string" }, { name: "disabled", type: "\"0\"|\"1\"" }, { name: "ruleOrder", type: "string" }, { name: "conditions", type: "Conditions[]" }] } },
  { id: "PolicyRuleResourceConditions", type: "model", position: { x: 0, y: 0 }, data: { ns: "policy", label: "PolicyRuleResourceConditions", fields: [{ name: "operator", type: "string" }, { name: "negated", type: "bool" }, { name: "operands", type: "Operands[]" }] } },
  { id: "PolicyRuleResourceOperands",   type: "model", position: { x: 0, y: 0 }, data: { ns: "policy", label: "PolicyRuleResourceOperands",   fields: [{ name: "objectType", type: "string" }, { name: "lhs", type: "string" }, { name: "rhs", type: "string (always)" }, { name: "values", type: "nil (always)" }] } },
  { id: "OperandsLHSRHS",               type: "model", position: { x: 0, y: 0 }, data: { ns: "policy", label: "OperandsResourceLHSRHSValue",  fields: [{ name: "lhs", type: "string" }, { name: "rhs", type: "string" }] } },
  { id: "PrivilegedCapabilities",        type: "model", position: { x: 0, y: 0 }, data: { ns: "policy", label: "PrivilegedCapabilities",       fields: [{ name: "capabilities", type: "string[]" }] } },
  { id: "Credential",                    type: "model", position: { x: 0, y: 0 }, data: { ns: "policy", label: "Credential",                   fields: [{ name: "id", type: "string" }, { name: "name", type: "string" }] } },

  // segment
  { id: "ApplicationSegmentResource", type: "model", position: { x: 0, y: 0 }, data: { ns: "segment", label: "ApplicationSegmentResource", fields: [{ name: "domainNames", type: "string[]" }, { name: "segmentGroupId", type: "string" }, { name: "serverGroups", type: "ServerGroup[]" }, { name: "tcpPortRange", type: "NetworkPorts[]" }, { name: "enabled", type: "bool" }] } },
  { id: "SegmentGroup",               type: "model", position: { x: 0, y: 0 }, data: { ns: "segment", label: "SegmentGroup",               fields: [{ name: "applications", type: "Application[]" }, { name: "enabled", type: "bool" }, { name: "policyMigrated", type: "bool" }] } },
  { id: "SharedMicrotenantDetails",   type: "model", position: { x: 0, y: 0 }, data: { ns: "segment", label: "SharedMicrotenantDetails",   fields: [{ name: "sharedFromMicrotenant", type: "ref" }, { name: "sharedToMicrotenants", type: "ref[]" }] } },

  // infra
  { id: "ServerGroup",       type: "model", position: { x: 0, y: 0 }, data: { ns: "infra", label: "ServerGroup",       fields: [{ name: "appConnectorGroups", type: "AppConnectorGroup[]" }, { name: "servers", type: "ApplicationServer[]" }, { name: "dynamicDiscovery", type: "bool" }, { name: "extranetDTO", type: "ExtranetDTO" }] } },
  { id: "AppConnectorGroup", type: "model", position: { x: 0, y: 0 }, data: { ns: "infra", label: "AppConnectorGroup", fields: [{ name: "connectors", type: "AppConnector[]" }, { name: "serverGroups", type: "AppServerGroup[]" }, { name: "praEnabled", type: "bool" }] } },
  { id: "AppConnector",      type: "model", position: { x: 0, y: 0 }, data: { ns: "infra", label: "AppConnector",      fields: [{ name: "controlChannelStatus", type: "string" }, { name: "currentVersion", type: "string" }, { name: "enabled", type: "bool" }] } },
  { id: "ApplicationServer", type: "model", position: { x: 0, y: 0 }, data: { ns: "infra", label: "ApplicationServer", fields: [{ name: "address", type: "string" }, { name: "appServerGroupIds", type: "string[]" }] } },

  // identity / scim
  { id: "IdpController",       type: "model", position: { x: 0, y: 0 }, data: { ns: "identity", label: "IdpController",       fields: [{ name: "scimEnabled", type: "bool" }, { name: "enableScimBasedPolicy", type: "bool" }, { name: "disableSamlBasedPolicy", type: "bool" }] } },
  { id: "ScimGroup",           type: "model", position: { x: 0, y: 0 }, data: { ns: "identity", label: "ScimGroup",           fields: [{ name: "id", type: "number" }, { name: "idpId", type: "number" }, { name: "name", type: "string" }] } },
  { id: "ScimAttributeHeader", type: "model", position: { x: 0, y: 0 }, data: { ns: "identity", label: "ScimAttributeHeader", fields: [{ name: "id", type: "string" }, { name: "idpId", type: "string" }, { name: "name", type: "string" }, { name: "dataType", type: "string" }] } },
  { id: "PostureProfile",      type: "model", position: { x: 0, y: 0 }, data: { ns: "identity", label: "PostureProfile",      fields: [{ name: "postureUdid", type: "string" }, { name: "platform", type: "string" }] } },
  { id: "TrustedNetwork",      type: "model", position: { x: 0, y: 0 }, data: { ns: "identity", label: "TrustedNetwork",      fields: [{ name: "networkId", type: "string" }, { name: "domain", type: "string" }] } },

  // common / db
  { id: "NetworkPorts",  type: "model", position: { x: 0, y: 0 }, data: { ns: "common", label: "NetworkPorts",    fields: [{ name: "from", type: "string" }, { name: "to", type: "string" }] } },
  { id: "ExtranetDTO",   type: "model", position: { x: 0, y: 0 }, data: { ns: "common", label: "ExtranetDTO",     fields: [{ name: "locationDTO", type: "[]" }, { name: "ziaErName", type: "string" }] } },
  { id: "ZPNERID",       type: "model", position: { x: 0, y: 0 }, data: { ns: "common", label: "ZPNERID",         fields: [{ name: "ziaErId", type: "string" }, { name: "ziaCloud", type: "string" }] } },
  { id: "SimulationRun", type: "model", position: { x: 0, y: 0 }, data: { ns: "common", label: "db.SimulationRun", fields: [{ name: "context_json", type: "string" }, { name: "action", type: "string" }, { name: "matched_rule_id", type: "string" }, { name: "result_json", type: "string" }] } },
];
