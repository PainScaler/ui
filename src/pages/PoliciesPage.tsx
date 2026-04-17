import { Alert, PageSection } from "@patternfly/react-core";
import { useAccessPolicies } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("policies");

export const PoliciesPage: React.FunctionComponent = () => {
  const { data: policies = [], isLoading, error } = useAccessPolicies();

  return (
    <PageSection aria-label="Policies">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={policies} columns={columns} isLoading={isLoading} tableKey="policies" />
    </PageSection>
  );
};
