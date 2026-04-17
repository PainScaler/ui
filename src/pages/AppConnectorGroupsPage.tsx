import { Alert, PageSection } from "@patternfly/react-core";
import { useAppConnectorGroups } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("appconnectorgroups");

export const AppConnectorGroupsPage: React.FunctionComponent = () => {
  const { data: groups = [], isLoading, error } = useAppConnectorGroups();

  return (
    <PageSection aria-label="App Connector Groups">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={groups} columns={columns} isLoading={isLoading} tableKey="appconnectorgroups" />
    </PageSection>
  );
};
