import { Route } from "../types";

/** "Ruta C01", "Ruta T01 (La Villa)" */
export const routeTitle = (route: Route): string =>
  `Ruta ${route.code}${route.variant ? ` (${route.variant})` : ""}`;

/** "Ida → Hacienda Popotes", "Vuelta", "Penal" o "" */
export const routeSubtitle = (route: Route): string => {
  const direction =
    route.direction === "ida"
      ? "Ida"
      : route.direction === "vuelta"
        ? "Vuelta"
        : null;
  if (direction && route.headsign) return `${direction} → ${route.headsign}`;
  if (direction) return direction;
  return route.headsign ?? "";
};
