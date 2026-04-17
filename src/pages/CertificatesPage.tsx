import { Alert, PageSection } from "@patternfly/react-core";
import { useCertificates } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("certificates");

export const CertificatesPage: React.FunctionComponent = () => {
  const { data: certificates = [], isLoading, error } = useCertificates();

  return (
    <PageSection aria-label="Certificates">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={certificates} columns={columns} isLoading={isLoading} tableKey="certificates" />
    </PageSection>
  );
};
