import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { environment } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { Permission } from '@eview/core/auth/permission';
import { GeoJsonObject } from '@eview/core/domain/post/geo-json';
import { Marker, Position } from '@eview/core/models/map';
import {
  EMapActions,
  SetMapDefaults,
  SetMapRegion,
  SimulateUserClickedMap,
  UserClickedMap,
  UserClickedMarker,
  UserClickedCommentMap
} from '@eview/core/store/actions/map.actions';
import { selectMap } from '@eview/core/store/selectors/map.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as happen from 'happen';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as lodash from 'lodash';
import { Subscription } from 'rxjs';
import * as shp from 'shpjs';
import * as mapIcons from './icons';

const MAP_INITIAL_CENTER: L.LatLngExpression = [0, 0];
const MAP_INITIAL_ZOOM: number = 1;
const MAP_ZOOM_POSITION: L.ControlPosition = 'bottomleft';
const MAP_LAYER_POSITION: L.ControlPosition = 'bottomleft';
const MAP_URL_TEMPLATE: string =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ZOOM_MAX: number = 19;
const MAP_ATTRIBUTION: string =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const CREATE_MAP_ID = 'post-create-map';

@Component({
  selector: 'eview-map',
  template: `
    <div class="map-container" style="height: 100%;">
      <div class="map-frame" style="height: 100%;">
        <div [id]="mapId" style="height: 100%; z-index: 0;"></div>
      </div>
    </div>
  `
})
export class MapComponent implements AfterViewInit, OnDestroy {

  @Input() disabled: boolean = false;

  @Input() marker: Position;

  @Input() getMarkersFromStore: boolean = false;

  @Input() mapId: string;

  private map: L.Map;

  private mapLayerControl: L.Control.Layers;

  private initiated: boolean = false;

  private userCanClick: boolean = false;

  private userCursorMarker: L.Marker = null;

  private userCursorProperties: any;

  private markers: Marker[];

  private mapMarkersCluster: L.MarkerClusterGroup;

  private clickedMapMarker: L.Marker;

  private initialZoom: number = null;

  private subs: Subscription;

  private isShapeFileClicked: boolean = false;

  constructor(private store: Store<AppState>, private actions$: Actions) {
    this.subs = new Subscription();
    setTimeout(() => {
        this.map.invalidateSize();
    }, 100);
  }

  ngAfterViewInit() {
    this.buildMap();
    this.initMap();
    this.listenToMapEvents();
    this.addShapefiles();
    this.handleAuthorization();

    if (this.marker) {
      this.addMarkerToMap(this.marker, this.map);
      this.map.setView([this.marker.lat, this.marker.lon], this.initialZoom);
    }

    this.store.select(selectMap).subscribe(map => {
      if (!map) return;

      if (
        !this.disabled &&
        map.actual &&
        map.actual.lat &&
        map.actual.lon &&
        !this.userCursorMarker &&
        this.userCanClick
      ) {
        this.userCursorMarker = this.addMarkerToMap(
          { lat: map.actual.lat, lon: map.actual.lon },
          this.map,
          mapIcons.userCursorIcon
        );
      }

      if (!this.marker && this.getMarkersFromStore && map.markers) {
        if (!lodash.isEqual(map.markers, this.markers)) {
          this.markers = map.markers;
          if (this.mapMarkersCluster)
            this.mapMarkersCluster.removeFrom(this.map);
          const mapMarkers = map.markers.map(m => this.buildMapMarker(m));
          mapMarkers.forEach(m =>
            m.addEventListener('click', event => {
              this.mapMarkerReportClick(event);
            })
          );

          this.mapMarkersCluster = new L.MarkerClusterGroup();
          this.mapMarkersCluster.addLayer(L.layerGroup(mapMarkers));
          this.map.addLayer(this.mapMarkersCluster);
        }
      }
    });

    this.subs.add(
      this.actions$
        .pipe(ofType<UserClickedCommentMap>(EMapActions.UserClickedCommentMap))
        .subscribe(action => {
          if (this.mapMarkersCluster) {
            const layers = this.mapMarkersCluster.getLayers();
            if (layers.length > 0) {
              const selectedMap = layers.filter((item: any) => {
                return item.feature.properties.id == action.payload;
              });
              this.mapMarkerReportClick({ target: selectedMap[0] });
            }
          }
        })
    );

    this.subs.add(
      this.actions$
        .pipe(
          ofType<SimulateUserClickedMap>(EMapActions.SimulateUserClickedMap)
        )
        .subscribe(action => {
          if (!action.payload || (action.payload && !action.payload.actual)) {
            if (this.userCursorMarker) {
              this.userCursorMarker.removeFrom(this.map);
              this.userCursorProperties = null;
            }
            return;
          }
          const { lat, lon } = action.payload.actual;
          const tempMarker = this.addMarkerToMap(
            { lat, lon },
            this.map,
            mapIcons.userCursorIcon
          );
          const boundingRect = tempMarker.getElement().getBoundingClientRect();  
          const [offsetLeft, offsetTop] = mapIcons.userCursorIcon.options
            .iconAnchor as [number, number];
          const left = boundingRect.left + offsetLeft / 2;
          const top = boundingRect.top + offsetTop;
          tempMarker.removeFrom(this.map);
          let ele = document.elementFromPoint(left, top);
          if (ele) {
            happen.click(ele, {
              type: 'click',
              clientX: left,
              clientY: top
            });
          }          
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  
  private buildMapMarker(marker: Marker, icon: L.Icon<any> = null): L.Marker {
    if (!icon) {
      if (marker.parent && marker.parent.color && marker.parent.icon)
        icon = mapIcons.customIcon(marker.parent);
      else icon = mapIcons.defaultIcon;
    }
    const m = L.marker({ lat: marker.lat, lng: marker.lon }, { icon: icon });
    m.feature = { type: null, geometry: null, properties: marker.parent };
    return m;
  }

  private addMarkerToMap(
    marker: Marker,
    map: L.Map,
    icon: L.Icon<any> = undefined
  ): L.Marker {
    return this.buildMapMarker(marker, icon).addTo(map);
  }

  private buildMap() {

    let mapOptions = {
      center: MAP_INITIAL_CENTER,
      zoom: MAP_INITIAL_ZOOM,
      zoomControl: false,
      scrollWheelZoom: false
    };
     
    if (this.mapId === CREATE_MAP_ID) {
      mapOptions['transform3DLimit'] = 2^23;
    }

    this.map = L.map(this.mapId, mapOptions);
    
    L.control
      .zoom({
        position: MAP_ZOOM_POSITION
      })
      .addTo(this.map);
    const tiles = L.tileLayer(MAP_URL_TEMPLATE, {
      maxZoom: MAP_ZOOM_MAX,
      attribution: MAP_ATTRIBUTION
    });
    tiles.addTo(this.map);
    this.mapLayerControl = L.control
      .layers(null, null, { position: MAP_LAYER_POSITION })
      .addTo(this.map);
    
  }

  private initMap() {
    this.store.select(selectMap).subscribe(map => {
      if (!map || this.initiated) return;
      this.map.setView([map.defaults.lat, map.defaults.lon], map.defaults.zoom);
      this.initiated = true;
      this.initialZoom = map.defaults.zoom;
      let mapElement = document.getElementsByClassName('leaflet-pane leaflet-map-pane')[0];
      mapElement.setAttribute('style', 'transform: translate3d(-45px, -19px, 0px)');
    });
    this.actions$
      .pipe(ofType<SetMapDefaults>(EMapActions.SetMapDefaults))
      .subscribe(actions => {
        if (!actions.payload || this.initiated) return;
        this.map.setView(
          [actions.payload.defaults.lat, actions.payload.defaults.lon],
          actions.payload.defaults.zoom
        );
        this.initiated = true;
      });
  }

  private listenToMapEvents() {
    if (!this.disabled) {
      this.map.addEventListener('click', (event: L.LeafletMouseEvent) => {
        if (this.userCursorProperties === undefined || this.isShapeFileClicked === false) {
          this.store.dispatch(
            new UserClickedMap({
              actual: {
                lat: null,
                lon: null,
                properties: null
              }
            })
          );
          return false;
        }
        
        this.unclickMapMarker();
        if (this.userCursorMarker) this.userCursorMarker.removeFrom(this.map);
        if (this.userCanClick) {
          this.userCursorMarker = this.addMarkerToMap(
            { lat: event.latlng.lat, lon: event.latlng.lng },
            this.map,
            mapIcons.userCursorIcon
          );
        }
        
        this.store.dispatch(
          new UserClickedMap({
            actual: {
              lat: event.latlng.lat,
              lon: event.latlng.lng,
              properties: this.userCursorProperties || null
            }
          })
        );
        this.isShapeFileClicked = false;
      });
    }
  }

  private addShapefiles() {
    const queue: Promise<any>[] = environment.map.shapeFiles.map(
      sf => shp(sf.uri) as Promise<any>
    );
    const configs = environment.map.shapeFiles.reduce(
      (cfgs, sh) => [...cfgs, ...sh.config],
      []
    );
    Promise.all(queue).then(data => {
      let regionList = [];
      data.forEach(d =>{
        d.forEach((d1: GeoJsonObject, index) => {
          if (index === 0) {
            if (d1.features) {
              d1.features.map((region, index) => {
                const regionName = region.properties;
                let obj = {
                  'region': (regionName.REGION) ? regionName.REGION : regionName.DISTRICT_A,
                  'district': regionName.DEPARTMNT,
                  'suos_pref': regionName.SOUS_PREF,
                };
                regionList.push(obj);
                d1.features[index].properties.REGION = obj.region;
              });
            }
            const regionGroupBy = lodash.groupBy(regionList, 'region');            
            this.store.dispatch(new SetMapRegion({'regions': regionGroupBy}));
          }
          const config = configs.find(c => {
            return c.fileName === d1.fileName}) || {
            base: false,
            selected: false,
            options: null,
            listenForClick: null
        };
          const layer = L.geoJSON(d1 as any, config.options);
          if (config.base) {
            this.mapLayerControl.addBaseLayer(
              layer,
              config.altName || d1.fileName
            );
            layer.addTo(this.map);
          } else {
            this.mapLayerControl.addOverlay(
              layer,
              config.altName || d1.fileName
            );
            if (config.select) layer.addTo(this.map);
          }

          if (config.listenForClick && config.listenForClick.enabled) {
            layer.addEventListener('click', (event: L.LeafletMouseEvent) => {
              this.isShapeFileClicked = true;
              if (config.listenForClick.dispatchProperties)
                this.userCursorProperties = {
                  ...this.userCursorProperties,
                  ...event.layer.feature.properties
                };
            });
          }
        })
      });
    });
  }

  private handleAuthorization() {
    AuthHelpers.User.HasUserPermission(
      this.store,
      Permission.SubmitPosts
    ).subscribe(can => {
      if (this.userCanClick !== can && this.userCursorMarker)
        this.userCursorMarker.removeFrom(this.map);
      this.userCanClick = can;
    });
  }

  private unclickMapMarker() {
    if (!this.clickedMapMarker) return;
    this.clickedMapMarker.setIcon(
      mapIcons.customIcon(this.clickedMapMarker.feature.properties)
    );
  }

  private mapMarkerReportClick(event) {
    this.unclickMapMarker();
    if (this.userCursorMarker) this.userCursorMarker.removeFrom(this.map);
    const marker = event.target as L.Marker;
    marker.setIcon(mapIcons.clickedIcon);
    this.clickedMapMarker = marker;
    this.clickedMapMarker.feature.properties.icon =
      this.clickedMapMarker.feature.properties.icon ||
      environment.defaults.tagIcon;
    this.clickedMapMarker.feature.properties.color =
      this.clickedMapMarker.feature.properties.color ||
      environment.defaults.tagColor;
    const parent = marker.feature.properties || null;
    this.store.dispatch(
      new UserClickedMarker({
        lat: marker.getLatLng().lat,
        lon: marker.getLatLng().lng,
        parent: { id: parent.id || null }
      })
    );
  }
}
