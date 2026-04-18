import { Banner } from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { GetAbout } from "@/shared/api/api.gen";

export function DemoBanner() {
  const { data } = useQuery({
    queryKey: ["about"],
    queryFn: GetAbout,
    staleTime: Infinity,
  });

  if (!data?.demo) return null;

  return (
    <Banner color="yellow" screenReaderText="Demo mode">
      Demo mode - synthetic data, state may reset periodically.
    </Banner>
  );
}
