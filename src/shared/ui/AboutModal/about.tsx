import {
  AboutModal,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Gallery,
  GalleryItem,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import logo from "@/../assets/painscaler.svg"
import bg from "@/../assets/painscaler-about-background.svg"
import { GetLibraries } from "@/shared/api/api.gen";

interface MyAboutModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Lib {
  name: string;
  version: string;
}

const FRONTEND_LIBS: Lib[] = [
  { name: "React", version: "19.2" },
  { name: "React Router", version: "7.14" },
  { name: "PatternFly", version: "6.4" },
  { name: "TanStack Query", version: "5.97" },
  { name: "TanStack Table", version: "8.21" },
  { name: "TanStack Virtual", version: "3.13" },
  { name: "React Flow", version: "11.11" },
  { name: "Zustand", version: "5.0" },
  { name: "Dagre", version: "3.0" },
  { name: "Vite", version: "8.0" },
  { name: "TypeScript", version: "6.0" },
];

function LibList({ libs }: { libs: Lib[] }) {
  return (
    <dl>
      {libs.map(({ name, version }) => (
        <div key={name} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <dt>{name}</dt>
          <dd style={{ margin: 0, opacity: 0.7 }}>{version}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function MyAboutModal({
  isModalOpen,
  setIsModalOpen,
}: MyAboutModalProps) {
  const { data: libraries } = useQuery({
    queryKey: ["libraries"],
    queryFn: GetLibraries,
    enabled: isModalOpen,
    staleTime: Infinity,
  });

  const backendLibs: Lib[] = libraries?.backend ?? [];

  return (
    <AboutModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      trademark={`(c) ${new Date().getFullYear()} PainScaler. ZPA is a trademark of Zscaler, Inc.`}
      brandImageSrc={logo}
      brandImageAlt="PainScaler Logo"
      backgroundImageSrc={bg}
      productName="PainScaler"
      hasNoContentContainer={true}
    >
      <Gallery hasGutter minWidths={{ default: "240px" }}>
        <GalleryItem>
          <Card isCompact={true}>
            <CardTitle>Build</CardTitle>
            <Divider />
            <CardBody>
              <dl>
                <dt>Frontend</dt>
                <dd>{__FRONTEND_VERSION__} ({__FRONTEND_COMMIT__})</dd>
                <dt>Frontend build</dt>
                <dd>{__FRONTEND_BUILD_DATE__}</dd>
                {libraries?.go && (
                  <>
                    <dt>Go runtime</dt>
                    <dd>{libraries.go}</dd>
                  </>
                )}
              </dl>
            </CardBody>
          </Card>
        </GalleryItem>
        <GalleryItem>
          <Card isCompact={true}>
            <CardTitle>Frontend libraries</CardTitle>
            <Divider />
            <CardBody>
              <LibList libs={FRONTEND_LIBS} />
            </CardBody>
          </Card>
        </GalleryItem>
        <GalleryItem>
          <Card isCompact={true}>
            <CardTitle>Backend libraries</CardTitle>
            <Divider />
            <CardBody>
              {backendLibs.length > 0 ? (
                <LibList libs={backendLibs} />
              ) : (
                <span style={{ opacity: 0.6 }}>loading...</span>
              )}
            </CardBody>
          </Card>
        </GalleryItem>
      </Gallery>
    </AboutModal>
  );
}
