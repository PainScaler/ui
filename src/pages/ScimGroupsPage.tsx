import { Alert, PageSection } from "@patternfly/react-core";
import { useScimGroups } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("scimgroups");

export const ScimGroupsPage: React.FunctionComponent = () => {
  const { data: groups = [], isLoading, error } = useScimGroups();

  return (
    <PageSection aria-label="SCIM Groups">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={groups} columns={columns} isLoading={isLoading} tableKey="scimgroups" />
    </PageSection>
  );
};
