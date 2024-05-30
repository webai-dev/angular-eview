export enum Type {
  Feature = 'Feature',
  FeatureCollection = 'FeatureCollection',
  Geometry = 'Geometry',
  GeometryCollection = 'GeometryCollection',
  Point = 'Point'
}

export interface GeoJsonObject {
  coordinates: number[];
  features?: GeoJsonObject[];
  fileName?: string;
  geometry?: GeoJsonObject;
  geometries?: GeoJsonObject[];
  properties?: {
    title?: string;
    descrition?: string;
    color?: string;
    icon?: string;
    id?: number;
    url?: string;
    SOUS_PREF?: string;
    REGION?: string;
    DEPARTMNT?: string;
    Admin2Name?: string;
    DISTRICT_A?: string;
    style?: any;
    name: string;
    count?: number;
  };
  total?: number;
  type: Type;
}
