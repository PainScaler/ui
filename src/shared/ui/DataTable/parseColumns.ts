import { columnDefs, type TableKey } from "./columnDefs";
import {
  type Renderer,
  defaultRenderer,
  textForRenderer,
  sortingFnForRenderer,
} from "./renderers";
import { titleCase } from "./titleCase";
import type { Column } from "./types";

export function parseColumns(tableKey: TableKey): Column[] {
  return columnDefs[tableKey].map((entry): Column => {
    const e = typeof entry === "string" ? { key: entry } : entry;
    const render: Renderer = e.render ?? defaultRenderer;
    return {
      key: e.key,
      label: e.label ?? titleCase(e.key),
      defaultVisible: e.visible ?? true,
      render,
      toText: textForRenderer(render),
      sortingFn: sortingFnForRenderer(render),
    };
  });
}
