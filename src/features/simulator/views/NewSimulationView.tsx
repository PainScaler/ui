import { SimContextWizard } from "@/features/simulator/components/SimContextWizard";
import { RunSimulation } from "@/shared/api/api.gen";
import type { simulator } from "@/shared/api/models.gen";

interface Props {
  onSubmitted: () => void;
}

export function NewSimulationView({ onSubmitted }: Props) {
  const handleRun = async (ctx: simulator.SimContext) => {
    await RunSimulation(ctx);
    onSubmitted();
  };

  return <SimContextWizard onRun={handleRun} />;
}
