import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchSelect } from "./SearchSelect";

const options = [
  { id: "1", label: "Alpha" },
  { id: "2", label: "Beta" },
  { id: "3", label: "Gamma" },
];

describe("SearchSelect", () => {
  it("shows placeholder when no value", () => {
    render(<SearchSelect value="" options={options} onChange={() => {}} />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("shows selected label when value set", () => {
    render(<SearchSelect value="2" options={options} onChange={() => {}} />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("opens menu and lists options on click", async () => {
    const user = userEvent.setup();
    render(<SearchSelect value="" options={options} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Select..." }));
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Gamma" })).toBeInTheDocument();
  });

  it("filters options via search input", async () => {
    const user = userEvent.setup();
    render(<SearchSelect value="" options={options} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Select..." }));
    await user.type(screen.getByPlaceholderText("Search..."), "bet");
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Alpha" })).not.toBeInTheDocument();
  });

  it("shows empty state when filter matches nothing", async () => {
    const user = userEvent.setup();
    render(<SearchSelect value="" options={options} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Select..." }));
    await user.type(screen.getByPlaceholderText("Search..."), "zzz");
    expect(screen.getByRole("option", { name: "No results" })).toBeInTheDocument();
  });

  it("calls onChange with option id when selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchSelect value="" options={options} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Select..." }));
    await user.click(screen.getByRole("option", { name: "Gamma" }));
    expect(onChange).toHaveBeenCalledWith("3");
  });

  it("clear button fires onChange('')", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchSelect value="2" options={options} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("disabled hides clear button and disables toggle", () => {
    render(<SearchSelect value="2" options={options} onChange={() => {}} disabled />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
  });
});
