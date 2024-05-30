import { Type, GeoJsonObject } from './geo-json';
import { Marker } from '@eview/core/models/map';

const ToMarkers = (geoJsons: GeoJsonObject): Marker[] => {
  if (geoJsons.type !== Type.FeatureCollection) return null;
  const getMarkersFromFeature = (feature: GeoJsonObject): Marker[] => {
    if (
      feature.type !== Type.Feature ||
      feature.geometry.type !== Type.GeometryCollection
    )
      return null;
    return feature.geometry.geometries.map(g => {
      if (g.type !== Type.Point) return null;
      const [lon, lat] = g.coordinates;
      return {
        lat,
        lon,
        parent: feature.properties
      };
    });
  };
  return geoJsons.features.reduce((markers, f) => {
    return [...markers, ...getMarkersFromFeature(f)];
  }, []);
};

export const FeatureHelpers = {
  ToMarkers
};
