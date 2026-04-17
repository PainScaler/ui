import { Alert, PageSection } from "@patternfly/react-core";
import { useSegmentGroups } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("appgroups");

export const AppGroupsPage: React.FunctionComponent = () => {
  const { data: groups = [], isLoading, error } = useSegmentGroups();

  return (
    <PageSection aria-label="Application Groups">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={groups} columns={columns} isLoading={isLoading} tableKey="appgroups" />
    </PageSection>
  );
};
