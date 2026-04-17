import { Alert, PageSection } from "@patternfly/react-core";
import { useSegments } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("applications");

export const ApplicationsPage: React.FunctionComponent = () => {
  const { data: segments = [], isLoading, error } = useSegments();

  return (
    <PageSection aria-label="Applications">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={segments} columns={columns} isLoading={isLoading} tableKey="applications" />
    </PageSection>
  );
};
