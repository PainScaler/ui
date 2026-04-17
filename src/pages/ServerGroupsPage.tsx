import { Alert, PageSection } from "@patternfly/react-core";
import { useServerGroups } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("servergroups");

export const ServerGroupsPage: React.FunctionComponent = () => {
  const { data: groups = [], isLoading, error } = useServerGroups();

  return (
    <PageSection aria-label="Server Groups">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={groups} columns={columns} isLoading={isLoading} tableKey="servergroups" />
    </PageSection>
  );
};
