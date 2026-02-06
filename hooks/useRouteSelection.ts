import { useState } from "react";

const useRouteSelection = (initialRoutes: string[]) => {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(initialRoutes);

  const toggleRoute = (routeId: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeId)
        ? prev.filter((id) => id !== routeId)
        : [...prev, routeId],
    );
  };

  const toggleAll = (allRouteIds: string[]) => {
    if (selectedRoutes.length === allRouteIds.length) {
      setSelectedRoutes([]);
    } else {
      setSelectedRoutes(allRouteIds);
    }
  };

  return {
    selectedRoutes,
    toggleRoute,
    toggleAll,
  };
};

export default useRouteSelection;
