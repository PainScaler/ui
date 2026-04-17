import { Button, ButtonVariant } from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { usePaletteStore } from "@/shared/stores/paletteStore";

export function PaletteTrigger() {
  const open = usePaletteStore((s) => s.open);
  const isMac = typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac");
  const hint = `${isMac ? "Cmd" : "Ctrl"}+K`;

  return (
    <Button
      variant={ButtonVariant.plain}
      onClick={open}
      aria-label={`Open command palette (${hint})`}
      icon={<SearchIcon />}
    />
  );
}


