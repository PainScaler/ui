import {
  Modal,
  ModalHeader,
  Content,
  Button,
  ModalBody,
  DataListControl,
  DataListCheck,
  DataListItemCells,
  DataListCell,
  DataList,
  ModalFooter,
} from "@patternfly/react-core";
import { DragDropSort } from "@patternfly/react-drag-drop";
import { type ColumnData } from "./types";
import "./CategoryModal.css";

interface DragItem {
  id: string;
  content: React.ReactNode;
  data: ColumnData;
}

// DataListItemRow clones its children with cloneElement(child, { rowid }) for
// accessibility. React.Fragment does not accept arbitrary props, so we need a
// real element as the wrapper. display:contents makes it invisible to the flex
// layout so DataListControl and DataListItemCells remain direct flex children.
function DragItemContent({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span style={{ display: "contents" }} {...props}>
      {children}
    </span>
  );
}

interface CategoryModalProps {
  isModalOpen: boolean;
  handleModalToggle: () => void;
  selectAllColumns: () => void;
  columnData: ColumnData[];
  initialColData: ColumnData[];
  setColumnData: React.Dispatch<React.SetStateAction<ColumnData[]>>;
  onSave: () => void;
  filterData: (checked: boolean, key: string) => void;
}

export default function CategoryModal({
  isModalOpen,
  handleModalToggle,
  selectAllColumns,
  columnData,
  initialColData,
  setColumnData,
  onSave,
  filterData,
}: CategoryModalProps) {
  return (
    <Modal
      isOpen={isModalOpen}
      variant="small"
      onClose={handleModalToggle}
      aria-labelledby="basic-modal-title"
      aria-describedby="modal-box-body-basic"
    >
      <ModalHeader
        title="Manage columns"
        labelId="basic-modal-title"
        description={
          <Content>
            <p>Selected categories will be displayed in the table.</p>
            <Button isInline onClick={selectAllColumns} variant="secondary">
              Select all
            </Button>
          </Content>
        }
      />
      <ModalBody id="modal-box-body-basic">
        <DragDropSort
          items={columnData.map((col) => ({
            id: col.key,
            content: (
              <DragItemContent>
                <DataListControl>
                  <DataListCheck
                    aria-labelledby={`table-column-management-item-${col.key}`}
                    isChecked={col.checked}
                    name={`check-${col.key}`}
                    id={`check-${col.key}`}
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
                      const newColumnData = columnData.map((c) =>
                        event.currentTarget.name === `check-${c.key}`
                          ? { ...c, checked: !c.checked }
                          : c,
                      );
                      filterData(
                        !columnData.find(
                          (c) => `check-${c.key}` === event.currentTarget.name,
                        )?.checked,
                        columnData.find(
                          (c) => `check-${c.key}` === event.currentTarget.name,
                        )?.key ?? "",
                      );
                      setColumnData(newColumnData);
                    }}
                  />
                </DataListControl>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell
                      id={`table-column-management-item-${col.key}`}
                      key={`table-column-management-item-${col.key}`}
                    >
                      <label htmlFor={`check-${col.key}`}>{col.label}</label>
                    </DataListCell>,
                  ]}
                />
              </DragItemContent>
            ),
            data: col,
          }))}
          onDrop={(_, newItems) => {
            setColumnData((newItems as DragItem[]).map((item) => item.data));
          }}
          variant="DataList"
          overlayProps={{ isCompact: true }}
        >
          <DataList
            aria-label="Table column management"
            id="table-column-management"
            className="column-management-list"
            isCompact
          />
        </DragDropSort>
      </ModalBody>
      <ModalFooter>
        <Button key="save" variant="primary" onClick={onSave}>
          Save
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            setColumnData(initialColData);
            handleModalToggle();
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
