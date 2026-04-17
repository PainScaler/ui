import { Alert, PageSection } from "@patternfly/react-core";
import { useAppConnectors } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("appconnectors");

export const AppConnectorsPage: React.FunctionComponent = () => {
  const { data: connectors = [], isLoading, error } = useAppConnectors();

  return (
    <PageSection aria-label="App Connectors">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={connectors} columns={columns} isLoading={isLoading} tableKey="appconnectors" />
    </PageSection>
  );
};
