// Import de CSS solo usado en MapContainer.web.tsx (leaflet/dist/leaflet.css).
// El bundler web de Expo lo resuelve; TypeScript necesita esta declaración
// ambiental para no marcarlo como módulo desconocido.
declare module "*.css";
