export interface Route {
  id: string;
  name: string;
  color: string;
  coordinates: Array<{ latitude: number; longitude: number }>;
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  route: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BusData {
  routes: Route[];
  stops: BusStop[];
}
