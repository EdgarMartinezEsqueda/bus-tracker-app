import { BusStop, Route, RouteGroup } from "../types";

/**
 * Agrupa las variantes (ida/vuelta/ramales) por código de ruta para
 * presentarlas como una sola tarjeta, estilo "C01 · Central — Hacienda Popotes".
 */
export const buildRouteGroups = (
  routes: Route[],
  stops: BusStop[],
): RouteGroup[] => {
  const stopsCountByCode = new Map<string, number>();
  for (const stop of stops) {
    for (const code of stop.routeCodes) {
      stopsCountByCode.set(code, (stopsCountByCode.get(code) ?? 0) + 1);
    }
  }

  const byCode = new Map<string, Route[]>();
  for (const route of routes) {
    const list = byCode.get(route.code) ?? [];
    list.push(route);
    byCode.set(route.code, list);
  }

  return [...byCode.entries()].map(([code, variants]) => ({
    code,
    name: groupName(code, variants),
    color: variants[0].color,
    zone: variants.find((v) => v.zone)?.zone ?? null,
    variants,
    stopsCount: stopsCountByCode.get(code) ?? 0,
  }));
};

/** "origen — destino" a partir de los headsigns de vuelta e ida. */
const groupName = (code: string, variants: Route[]): string => {
  const ida = variants.find((v) => v.direction === "ida" && v.headsign);
  const vuelta = variants.find((v) => v.direction === "vuelta" && v.headsign);
  if (ida?.headsign && vuelta?.headsign) {
    return `${capitalize(vuelta.headsign)} — ${capitalize(ida.headsign)}`;
  }
  const any = variants.find((v) => v.headsign);
  if (any?.headsign) return capitalize(any.headsign);
  return `Ruta ${code}`;
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Búsqueda insensible a mayúsculas y acentos sobre código/nombre/zona. */
export const matchesQuery = (group: RouteGroup, query: string): boolean => {
  const normalized = normalize(query);
  if (normalized === "") return true;
  const haystack = normalize(
    [
      group.code,
      group.name,
      group.zone ?? "",
      ...group.variants.map((v) => `${v.name} ${v.headsign ?? ""} ${v.variant ?? ""}`),
    ].join(" "),
  );
  return normalized
    .split(/\s+/)
    .every((word) => haystack.includes(word));
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
