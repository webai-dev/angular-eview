import { Map } from '@eview/core/models/map';

export interface MapState {
  map: Map;
}

export const initialMapState: MapState = {
  map: null
};
