import { Link } from "react-router-dom";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from "@patternfly/react-core";
import PathMissingIcon from "@patternfly/react-icons/dist/esm/icons/path-missing-icon";

export const NotFoundPage: React.FunctionComponent = () => (
  <PageSection>
    <EmptyState
      titleText="Page not found"
      icon={PathMissingIcon}
      headingLevel="h1"
    >
      <EmptyStateBody>
        The page you requested does not exist.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="primary" component={(props) => <Link to="/overview" {...props} />}>
            Go to Overview
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  </PageSection>
);
