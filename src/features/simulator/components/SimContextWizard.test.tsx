import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { SimContextWizard } from "./SimContextWizard";

const indexStub = {
  SegmentGroups: {
    g1: { id: "g1", name: "Group One" },
  },
  Segments: {
    s1: { id: "s1", name: "Seg One", segmentGroupId: "g1" },
  },
  ScimGroups: {},
  ScimAttrNameToID: {},
  DomainToSegments: {},
};

function setupHandlers() {
  server.use(
    http.get("/api/v1/index", () => HttpResponse.json(indexStub)),
    http.get("/api/v1/zpa/platforms", () => HttpResponse.json(["Windows", "Mac"])),
    http.get("/api/v1/zpa/trusted-networks", () => HttpResponse.json([])),
  );
}

function renderWizard(onRun = vi.fn().mockResolvedValue(undefined)) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SimContextWizard onRun={onRun} />
    </QueryClientProvider>,
  );
}

describe("SimContextWizard", () => {
  it("renders first step with Access Target heading", async () => {
    setupHandlers();
    renderWizard();
    await waitFor(() =>
      expect(screen.getAllByText("Access Target").length).toBeGreaterThan(0),
    );
  });

  it("blocks advance and shows error when neither fqdn nor segment chosen", async () => {
    setupHandlers();
    const user = userEvent.setup();
    renderWizard();
    await waitFor(() => screen.getAllByText("Access Target"));
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    expect(
      await screen.findByText("Select a segment or enter an FQDN."),
    ).toBeInTheDocument();
  });

  it("renders all four step names in navigation", async () => {
    setupHandlers();
    renderWizard();
    await waitFor(() => screen.getAllByText("Access Target"));
    expect(screen.getAllByText("User Identity").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Client Context").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Review & Submit").length).toBeGreaterThan(0);
  });
});
