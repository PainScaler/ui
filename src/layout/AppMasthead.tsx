import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Brand,
  Button,
  ButtonVariant,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  type MenuToggleElement,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import CogIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";
import DesktopIcon from "@patternfly/react-icons/dist/esm/icons/desktop-icon";
import MoonIcon from "@patternfly/react-icons/dist/esm/icons/moon-icon";
import SunIcon from "@patternfly/react-icons/dist/esm/icons/sun-icon";
import QuestionCircleIcon from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import SyncAltIcon from "@patternfly/react-icons/dist/esm/icons/sync-alt-icon";
import EllipsisVIcon from "@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon";
import logo from "@/../assets/painscaler.svg";
import MyAboutModal from "@/shared/ui/AboutModal/about";
import { useColorMode, type ColorMode } from "@/shared/lib/useColorMode";
import { Refresh } from "@/shared/api/api.gen";
import { queryClient } from "@/queryClient";
import { PaletteTrigger } from "@/shared/ui/CommandPalette";

const COLOR_MODE_ITEMS: {
  value: ColorMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <DesktopIcon /> },
];

export const AppMasthead: React.FunctionComponent = () => {
  const { mode, setMode } = useColorMode();
  const { pathname } = useLocation();
  const isGraphPage = pathname === "/model-graph" || pathname === "/flow";
  const isDark =
    document.documentElement.classList.contains("pf-v6-theme-dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKebabDropdownOpen, setIsKebabDropdownOpen] = useState(false);
  const [isFullKebabDropdownOpen, setIsFullKebabDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Refresh();
      await queryClient.invalidateQueries();
    } catch (e) {
      console.error("refresh failed", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const colorModeItems = COLOR_MODE_ITEMS.map(({ value, label, icon }) => (
    <DropdownItem
      key={value}
      icon={icon}
      isSelected={mode === value}
      onClick={() => {
        setMode(value);
        setIsSettingsOpen(false);
      }}
    >
      {label}
    </DropdownItem>
  ));

  const colorModeKebabItems = COLOR_MODE_ITEMS.map(({ value, label, icon }) => (
    <DropdownItem
      key={value}
      icon={icon}
      isSelected={mode === value}
      onClick={() => setMode(value)}
    >
      {label}
    </DropdownItem>
  ));

  const kebabDropdownItems = <>{colorModeKebabItems}</>;

  const headerToolbar = (
    <Toolbar id="toolbar" isStatic>
      <ToolbarContent>
        <ToolbarGroup
          variant="action-group-plain"
          align={{ default: "alignEnd" }}
          gap={{ default: "gapNone", md: "gapMd" }}
        >
          <ToolbarGroup
            variant="action-group-plain"
            visibility={{ default: "hidden", lg: "visible" }}
          >
            <ToolbarItem>
              <PaletteTrigger />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                aria-label="Refresh data"
                variant={ButtonVariant.plain}
                icon={
                  <SyncAltIcon
                    style={{
                      animation: isRefreshing
                        ? "pf-spin 1s linear infinite"
                        : undefined,
                    }}
                  />
                }
                onClick={handleRefresh}
                isDisabled={isRefreshing}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isSettingsOpen}
                onSelect={() => setIsSettingsOpen(false)}
                onOpenChange={(open) => setIsSettingsOpen(open)}
                popperProps={{ position: "right" }}
                toggle={(ref: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={ref}
                    onClick={() => setIsSettingsOpen((o) => !o)}
                    isExpanded={isSettingsOpen}
                    variant="plain"
                    aria-label="Settings"
                    icon={<CogIcon />}
                  />
                )}
              >
                <DropdownList>{colorModeItems}</DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                aria-label="Help"
                variant={ButtonVariant.plain}
                icon={<QuestionCircleIcon />}
                onClick={() => setIsHelpModalOpen(true)}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup visibility={{ default: "hidden", md: "visible", lg: "hidden" }}>
                <ToolbarItem>
              <PaletteTrigger />
            </ToolbarItem>
    
          <ToolbarItem>
            <Dropdown
              isOpen={isKebabDropdownOpen}
              onSelect={() => setIsKebabDropdownOpen(false)}
              onOpenChange={(isOpen: boolean) => setIsKebabDropdownOpen(isOpen)}
              popperProps={{ position: "right" }}
              style={{
                paddingTop: 0
              }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsKebabDropdownOpen(!isKebabDropdownOpen)}
                  isExpanded={isKebabDropdownOpen}
                  variant="plain"
                  aria-label="Settings and help"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              <DropdownList>
                <DropdownItem
                  aria-label="Refresh data"
                  onClick={handleRefresh}
                  isDisabled={isRefreshing}
                  icon={
                    <SyncAltIcon
                      style={{
                        animation: isRefreshing
                          ? "pf-spin 1s linear infinite"
                          : undefined,
                      }}
                    />
                  }
                >
                  Refresh
                </DropdownItem>
                <Divider />
                {kebabDropdownItems}
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup visibility={{ md: "hidden" }}>
                  <ToolbarItem>
              <PaletteTrigger />
            </ToolbarItem>
          
          <ToolbarItem>
            <Dropdown
              isOpen={isFullKebabDropdownOpen}
              onSelect={() => setIsFullKebabDropdownOpen(false)}
               style={{
                    paddingTop: 0
                  }}
              onOpenChange={(isOpen: boolean) =>
                setIsFullKebabDropdownOpen(isOpen)
              }
              popperProps={{ position: "right" }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() =>
                    setIsFullKebabDropdownOpen(!isFullKebabDropdownOpen)
                  }
                  isExpanded={isFullKebabDropdownOpen}
                  variant="plain"
                  aria-label="Toolbar menu"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              <DropdownList>
                <DropdownItem
                  aria-label="Refresh data"
                  onClick={handleRefresh}
                  isDisabled={isRefreshing}
                  icon={
                    <SyncAltIcon
                      style={{
                        animation: isRefreshing
                          ? "pf-spin 1s linear infinite"
                          : undefined,
                      }}
                    />
                  }
                >
                  Refresh
                </DropdownItem>
                <Divider />
                {kebabDropdownItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
          </ToolbarGroup>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  return (
    <>
      <Masthead
        style={
          isGraphPage
            ? {
                borderBottom:
                  "1px solid var(--pf-t--global--border--color--default)",
                boxShadow: isDark
                  ? "0 2px 8px rgba(0,0,0,0.25)"
                  : "var(--pf-t--global--box-shadow--sm--bottom)",
              }
            : undefined
        }
      >
        <MastheadMain>
          <MastheadToggle>
            <PageToggleButton
              isHamburgerButton
              aria-label="Global navigation"
            />
          </MastheadToggle>
          <MastheadBrand>
            <MastheadLogo>
              <Brand
                src={logo}
                alt="PainScaler"
                heights={{ default: "36px" }}
              />
            </MastheadLogo>
          </MastheadBrand>
        </MastheadMain>
        <MastheadContent>{headerToolbar}</MastheadContent>
      </Masthead>
      <MyAboutModal
        isModalOpen={isHelpModalOpen}
        setIsModalOpen={setIsHelpModalOpen}
      />
    </>
  );
};
