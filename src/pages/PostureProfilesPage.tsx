import { Alert, PageSection } from "@patternfly/react-core";
import { usePostureProfiles } from "@/shared/api/queries";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";

const columns = parseColumns("postureprofiles");

export const PostureProfilesPage: React.FunctionComponent = () => {
  const { data: profiles = [], isLoading, error } = usePostureProfiles();

  return (
    <PageSection aria-label="Posture Profiles">
      {error && <Alert variant="danger" isInline title={String(error)} />}
      <DataWrapper data={profiles} columns={columns} isLoading={isLoading} tableKey="postureprofiles" />
    </PageSection>
  );
};
