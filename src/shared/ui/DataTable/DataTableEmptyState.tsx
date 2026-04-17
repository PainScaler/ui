import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";

interface DataTableEmptyStateProps {
  colSpan: number;
  onClearFilters: () => void;
}

export function DataTableEmptyState({
  colSpan,
  onClearFilters,
}: DataTableEmptyStateProps) {
  return (
    <Tr>
      <Td colSpan={colSpan}>
        <Bullseye>
          <EmptyState
            titleText="No results found"
            icon={SearchIcon}
            headingLevel="h2"
            variant={EmptyStateVariant.sm}
          >
            <EmptyStateBody>
              No results match this filter criteria. Clear all filters and try
              again.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={onClearFilters}>
                  Clear all filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
}
