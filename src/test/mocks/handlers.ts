import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/segments", () => HttpResponse.json([])),
  http.get("/api/segment-groups", () => HttpResponse.json([])),
  http.get("/api/access-policies", () => HttpResponse.json([])),
];
