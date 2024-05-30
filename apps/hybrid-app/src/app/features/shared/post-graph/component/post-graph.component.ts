import {
  Component,
  Input,
  AfterViewInit,
  OnInit,
  OnChanges
} from '@angular/core';
import { environment } from '@eview/core';
import { GeoJsonObject } from '@eview/core/domain/post/geo-json';
import { selectMap } from '@eview/core/store/selectors/map.selector';
import { Store } from '@ngrx/store';
import { AppState } from '@eview/core/store/states/app.state';
import * as L from 'leaflet';
import * as shp from 'shpjs';
import { FilterHelpers } from '@eview/core/domain/filters/filters.helper';
const MAP_ID: string = 'region-map';
const MAP_INITIAL_CENTER: L.LatLngExpression = [0, 0];
const MAP_INITIAL_ZOOM: number = 7;
const MAP_ZOOM_POSITION: L.ControlPosition = 'bottomleft';
const MAP_LAYER_POSITION: L.ControlPosition = 'bottomleft';
const MAP_URL_TEMPLATE: string =
  '';
const MAP_ZOOM_MAX: number = 8;
const MAP_ATTRIBUTION: string =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

@Component({
  selector: 'eview-post-graph',
  templateUrl: 'post-graph.component.html'
})
export class PostGraphComponent implements AfterViewInit, OnInit, OnChanges {
  constructor(private store: Store<AppState>) {}

  @Input() data: Object[];
  @Input() index: number;
  @Input() isSingle: boolean;
  @Input() xAxisLabel: string;
  @Input() yAxisLabel: string;
  @Input() legendPosition: string;
  @Input() type: number;
  @Input() legendTitle: string;

  mapId: string = MAP_ID;
  private map: L.Map;
  private mapLayerControl: L.Control.Layers;
  private layer: any;

  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  showDataLabel: boolean = true;

  ngOnInit() {
    this.mapId = this.mapId + '_' + this.index;
  }

  ngOnChanges() {
      if (this.type === 4) {
        this.showHideMap();
      } else {
        this.onMapContainerShowHide(false);
      }
  }

  onRemoveMapLayers() {
    if (this.map) {
      this.map.eachLayer((layer) => {
        this.mapLayerControl.removeLayer(layer);
      });
    }
  }

  onMapContainerShowHide(flag) {
    let mapContainer = document.getElementById('report-map-container');
    if (mapContainer) {
      mapContainer.style.display = flag ? 'block' : 'none';
    }
    this.onRemoveMapLayers();
  }

  highlightFeature(e) {
    let layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  resetHighlight(e) {
    this.layer.resetStyle(e.target);
  }

  zoomToFeature(e) {
    this.map.fitBounds(e.target.getBounds());
  }

  showHideMap() {
    this.addShapefiles(this.data);
    this.onMapContainerShowHide(true);
  }

  onEachFeature(feature, layer) {
    layer.on({
      mouseover: this.highlightFeature.bind(this),
      mouseout: this.resetHighlight.bind(this),
      click: this.zoomToFeature.bind(this)
    });
  }

  getColor(d) {
    return d >= 100
      ? '#710202'
      : d >= 50
      ? '#B50000'
      : d >= 20
      ? '#D25B00'
      : d >= 10
      ? '#DF9E11'
      : d >= 5
      ? '#ECDA36'
      : d >= 2
      ? '#C0E8AB'
      : '#ffffff';
  }

  getRegionStyle(feature) {
    return {
      fillColor: this.getColor(feature.properties.count),
      weight: 2,
      opacity: 1,
      color: 'grey',
      dashArray: '3',
      fillOpacity: 0.7,
      innerHTML: feature.properties.name
    };
  }

  addShapefiles(results: any) {
    const queue: Promise<any>[] = environment.map.shapeFiles.map(
      sf => shp(sf.uri) as Promise<any>
    );
    const configs = environment.map.shapeFiles.reduce(
      (cfgs, sh) => [...cfgs, ...sh.config],
      []
    );
    if (this.map) {
      this.map.removeControl(this.mapLayerControl);
      this.mapLayerControl = L.control
      .layers(null, null, { position: MAP_LAYER_POSITION })
      .addTo(this.map);
    }
    
    this.onRemoveMapLayers();
    
    Promise.all(queue).then(data => {
      data.forEach(d =>
        d.forEach((d1: GeoJsonObject, index) => {
            const temp = d1.features.map(item => {
              if (results && results.length > 0) {
                let name: string = '';
                  if (results[index] !== undefined) {
                    const reportCount = results[index].filter(region => {
                      let flag: boolean = false;
                      if (item.properties && item.properties.SOUS_PREF) {
                        item.properties.SOUS_PREF = FilterHelpers.GetModifiedRegionName(item.properties.SOUS_PREF, region.name);
                        flag = (region.name == item.properties.SOUS_PREF);
                        name = item.properties.SOUS_PREF;
                      } else if (item.properties && item.properties.DEPARTMNT)  {
                        item.properties.DEPARTMNT = FilterHelpers.GetModifiedRegionName(item.properties.DEPARTMNT, region.name);
                        flag = (region.name == item.properties.DEPARTMNT);
                        name = item.properties.DEPARTMNT;
                      } else {
                        item.properties.REGION = FilterHelpers.GetModifiedRegionName(item.properties.REGION, region.name);
                        flag = (region.name == item.properties.REGION);
                        name = item.properties.REGION;
                      }
                      return flag;
                    });
                    item.properties.name = name;
                    item.properties.count = (reportCount && reportCount[0])? reportCount[0].count : 0;
                  }      
              }      
              return item;
            });
            this.layer = null;
            this.layer = L.geoJSON(temp as any, {
              style: this.getRegionStyle.bind(this),
              onEachFeature: this.onEachFeature.bind(this)
            }).bindTooltip((layer: any) => {
              let tooltip = '';
              if (index === 0) {
                tooltip = layer.feature.properties.SOUS_PREF;
              } else if (index === 1) {
                tooltip = layer.feature.properties.DEPARTMNT;
              } else {
                tooltip = layer.feature.properties.REGION;
              }
              tooltip = tooltip + '(' + layer.feature.properties.count + ')';
              return tooltip;
            }); 
            
            const config = configs.find(c => c.fileName === d1.fileName) || {
              base: false,
              selected: false,
              options: null,
              listenForClick: null
            };
            if (this.mapLayerControl) {
               this.mapLayerControl.addBaseLayer(
                this.layer,
                config.altName || d1.fileName
              );
            }
            if (index === 2) {
              this.layer.addTo(this.map);           
            }
        })
      );
    });
  }

  

  ngAfterViewInit() {
    this.buildMap();
  }

  buildMap() {
      this.map = L.map(this.mapId, {
        center: MAP_INITIAL_CENTER,
        zoom: MAP_INITIAL_ZOOM,
        zoomControl: false,
        scrollWheelZoom: false
      });

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
      this.store.select(selectMap).subscribe(map => {
        if (!map) return;
        this.map.setView([map.defaults.lat, map.defaults.lon], MAP_INITIAL_ZOOM);
      });
      let mapElement = document.getElementsByClassName('leaflet-pane leaflet-map-pane')[0];
      mapElement.setAttribute('style', 'transform: translate3d(-60px, -30px, 0px)');

      let legend = L.control.attribution({ position: 'bottomright' });
      legend.onAdd = map => {
        let div = L.DomUtil.create('div', 'info legend'),
          grades = [2, 5, 10, 20, 50, 100];
        div.style.display = "flex";
        div.style.flexDirection = "column";
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<div style="margin: 5px"><i style="background:' +
            this.getColor(grades[i]) +
            '; width: 18px; padding-left:1px; height: 18px; opacity:0.7;margin-right:3px; float:left;"></i> ' +
            grades[i] +
            (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+');
        }
        div.innerHTML += '</div>';
        div.style.lineHeight = '18px';
        div.style.color = '#555';
        return div;
      };
      legend.addTo(this.map);
      this.onMapContainerShowHide(false);
    }
}
