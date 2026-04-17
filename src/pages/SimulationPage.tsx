import { PageSection, Tabs, Tab, TabTitleText } from "@patternfly/react-core";
import { useState, useCallback } from "react";
import { resetScroll } from "@/shared/lib/scroll";
import { HistoryView } from "@/features/simulator/views/HistoryView";
import { NewSimulationView } from "@/features/simulator/views/NewSimulationView";
import { VirtualPolicyView } from "@/features/simulator/views/VirtualPolicyView";

export const SimulationPage: React.FunctionComponent = () => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabClick = (
    _event: React.MouseEvent<unknown> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
    resetScroll();
  };

  const handleSubmitted = useCallback(() => {
    setActiveTabKey(0);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <PageSection hasOverflowScroll aria-label="Simulator" style={{
      paddingTop: 16
    }} padding={{
      default: "noPadding"
    }}>
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} role="region">
        <Tab eventKey={0} title={<TabTitleText>Scans</TabTitleText>}>
          <HistoryView refreshKey={refreshKey} />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>New Scan</TabTitleText>}>
          <NewSimulationView onSubmitted={handleSubmitted} />
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Virtual Policy</TabTitleText>}>
          <VirtualPolicyView />
        </Tab>
      </Tabs>
    </PageSection>
  );
};
