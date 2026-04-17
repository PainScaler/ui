import { DeleteSimulationRun, ListSimulationRuns } from "@/shared/api/api.gen";
import { simulator } from "@/shared/api/models.gen";
import { useEffect, useState } from "react";
import { useCloseOnOutsideClick } from "@/shared/lib/useCloseOnOutsideClick";
import { Alert } from "@patternfly/react-core";
import { parseColumns } from "@/shared/ui/DataTable/parseColumns";
import { DataWrapper } from "@/shared/ui/DataTable/DataWrapper";
import type { RowDetailModalProps } from "@/shared/ui/DataTable/types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@patternfly/react-core";
import { DecisionResultText } from "@/features/simulator/components/DecisionResult/DecisionResult";
import type { IAction } from "@patternfly/react-table";

const columns = parseColumns("simulationruns");

function RowSimulatioDetailModal({
  isOpen,
  onClose,
  row,
  columns,
}: RowDetailModalProps) {
  const title = row ? String(row[columns[0]?.key] ?? "Details") : "Details";

  const result = simulator.DecisionResult.createFrom(
    row ? row.result_json : {},
  );
  const context = simulator.SimContext.createFrom(
    row ? row.context_json : {},
  );

  useCloseOnOutsideClick(isOpen, onClose);

  return (
    <Modal
      isOpen={isOpen}
      variant="large"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClose={(_event) => onClose()}
      aria-labelledby="row-detail-title"
    >
      <ModalHeader title={`Simulation ${title}`} labelId="row-detail-title" />
      <ModalBody>
        <DecisionResultText result={result} context={context} />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function HistoryView({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ListSimulationRuns(20, 0)
      .then((runs) => setData(runs as unknown as Record<string, unknown>[]))
      .catch((err) => setError(String(err)));
  }, [refreshKey]);

  const handleDelete = () => {
    if (pendingDelete === null) return;
    DeleteSimulationRun(pendingDelete)
      .then(() =>
        ListSimulationRuns(20, 0)
          .then((runs) => setData(runs as unknown as Record<string, unknown>[]))
          .catch((err) => setError(String(err))),
      )
      .catch((err) => setError(String(err)))
      .finally(() => setPendingDelete(null));
  };

  const lastRowActions = (row: Record<string, unknown>): IAction[] => [
    {
      title: "Delete",
      isDanger: true,
      onClick: () => setPendingDelete(row.id as number),
    },
  ];

  return (
    <>
      {error && <Alert variant="danger" isInline title={error} />}
      <DataWrapper
        data={data}
        columns={columns}
        isLoading={false}
        rowDetailModal={RowSimulatioDetailModal}
        actions={lastRowActions}
        singleAction={(_row, onClick) => (
          <Button variant="secondary" onClick={onClick}>
            Details
          </Button>
        )}
      />
      <Modal
        isOpen={pendingDelete !== null}
        variant="small"
        onClose={() => setPendingDelete(null)}
        aria-labelledby="delete-confirm-title"
      >
        <ModalHeader
          title="Delete simulation run?"
          labelId="delete-confirm-title"
        />
        <ModalBody>This action cannot be undone.</ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="link" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
