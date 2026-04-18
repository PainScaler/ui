import { useCloseOnOutsideClick } from "@/shared/lib/useCloseOnOutsideClick";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from "@patternfly/react-core";
import type { RowDetailModalProps } from "./types";
import { formatCell } from "./formatCell";

export function RowDetailModal({
  isOpen,
  onClose,
  row,
  columns,
}: RowDetailModalProps) {
  const title = row ? formatCell(row[columns[0]?.key], "Details") : "Details";

  useCloseOnOutsideClick(isOpen, onClose);

  return (
    <Modal
      isOpen={isOpen}
      variant="medium"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClose={(_event) => onClose()}
      aria-labelledby="row-detail-title"
    >
      <ModalHeader title={title} labelId="row-detail-title" />
      <ModalBody>
        <DescriptionList
          isHorizontal
          isCompact
          columnModifier={{ default: "1Col" }}
        >
          {columns.map((col) => (
            <DescriptionListGroup key={col.key}>
              <DescriptionListTerm>{col.label}</DescriptionListTerm>
              <DescriptionListDescription>
                {col.render
                  ? col.render(row?.[col.key])
                  : formatCell(row?.[col.key])}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
