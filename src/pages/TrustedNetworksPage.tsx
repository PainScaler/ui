import { Alert, PageSection } from "@patternfly/react-core";
import { useTrustedNetworks } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("trustednetworks");

export const TrustedNetworksPage: React.FunctionComponent = () => {
  const { data: networks = [], isLoading, error } = useTrustedNetworks();

  return (
    <PageSection aria-label="Trusted Networks">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={networks} columns={columns} isLoading={isLoading} tableKey="trustednetworks" />
    </PageSection>
  );
};
