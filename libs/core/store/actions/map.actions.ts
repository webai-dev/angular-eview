import { Action } from '@ngrx/store';
import { Map, Marker } from '@eview/core/models/map';

export enum EMapActions {
  SetMapDefaults = '[Map] Set defaults',
  UserClickedMap = '[Map] User clicked the map',
  UserClickedMarker = '[Map] User clicked on a marker',
  ClearMapActual = '[Map] Clear actual',
  SetMapMarkers = '[Map] Set Markers',
  SimulateUserClickedMap = '[Map] Simulate User clicked the map',
  UserClickedCommentMap = '[Map] Simulate User clicked comment report',
  SetMapRegion = '[MAP] Set Map Region'
}

export class SetMapDefaults implements Action {
  readonly type = EMapActions.SetMapDefaults;
  constructor(public payload: Map) {}
}

export class UserClickedMap implements Action {
  readonly type = EMapActions.UserClickedMap;
  constructor(public payload: Map) {}
}

export class UserClickedMarker implements Action {
  readonly type = EMapActions.UserClickedMarker;
  constructor(public payload: Marker) {}
}

export class ClearMapActual implements Action {
  readonly type = EMapActions.ClearMapActual;
}

export class SetMapMarkers implements Action {
  readonly type = EMapActions.SetMapMarkers;
  constructor(public payload: Map) {}
}

export class SimulateUserClickedMap implements Action {
  readonly type = EMapActions.SimulateUserClickedMap;
  constructor(public payload: Map) {}
}

export class UserClickedCommentMap implements Action {
  readonly type = EMapActions.UserClickedCommentMap;
  constructor(public payload: number) {}
}

export class SetMapRegion implements Action {
  readonly type = EMapActions.SetMapRegion;
  constructor(public payload: Map) {}
}

export type MapActions =
  | SetMapDefaults
  | UserClickedMap
  | UserClickedMarker
  | ClearMapActual
  | SetMapMarkers
  | UserClickedCommentMap
  | SetMapRegion;
