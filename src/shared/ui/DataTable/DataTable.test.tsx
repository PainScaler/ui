import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./DataTable";
import { useColumnStore } from "@/shared/stores/columnStore";
import type { Column } from "./types";

const columns: Column[] = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
];

const rows = [
  { name: "Charlie", age: 30 },
  { name: "Alice", age: 25 },
  { name: "Bob", age: 40 },
];

describe("DataTable", () => {
  beforeEach(() => {
    localStorage.clear();
    useColumnStore.setState({ visibility: {}, order: {}, sorting: {} });
  });

  it("renders all rows and headers", () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(
      <DataTable columns={columns} rows={[]} isLoading />,
    );
    expect(container.querySelectorAll(".pf-v6-c-skeleton").length).toBeGreaterThan(0);
  });

  it("shows empty state when rows=[]", () => {
    render(<DataTable columns={columns} rows={[]} />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("filters rows via toolbar input", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Alice");
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("toggles sort on column header click", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} />);
    await user.click(screen.getByRole("button", { name: "Name" }));
    const body = document.querySelector("tbody")!;
    const firstCell = within(body).getAllByRole("cell")[0];
    expect(firstCell.textContent).toBe("Alice");
  });

  it("persists sorting under tableKey", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} tableKey="people" />);
    await user.click(screen.getByRole("button", { name: "Age" }));
    expect(useColumnStore.getState().sorting.people).toEqual([
      { id: "age", desc: false },
    ]);
  });
});
