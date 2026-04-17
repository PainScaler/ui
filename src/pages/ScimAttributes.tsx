import { Alert, PageSection } from "@patternfly/react-core";
import { useScimAttributeHeaders } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("scimattributes");

export const ScimAttributesPage = () => {
  const { data: scimAttributeHeaders, isLoading, error } = useScimAttributeHeaders();
  const attr = scimAttributeHeaders ?? [];

  return (
    <PageSection aria-label="SCIM Attributes">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper columns={columns} data={attr} isLoading={isLoading} tableKey="scimattributes" />
    </PageSection>
  );
};
