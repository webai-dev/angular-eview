import { AllowedPriviledge } from '../auth/auth';
import { BaseModelArray, BaseModel } from '../base/base-model';

export interface Config extends BaseModelArray<ConfigItem> {}

export interface ConfigItem extends BaseModel {}

export class SiteConfigItem implements ConfigItem {
  id = 'site';
  url: string;
  allowed_privileges: AllowedPriviledge[];
  name: string;
  description: string;
  email: string;
  timezone: string;
  language: string;
  date_format: string;
  client_url: boolean;
  first_login: boolean;
  tier: string;
  private: boolean;
}

export class MapConfigItem implements ConfigItem {
  id = 'map';
  url: string;
  allowed_privileges: AllowedPriviledge[];
  clustering: boolean;
  cluster_radius: number;
  location_precision: number;
  default_view: {
    lat: number;
    lon: number;
    zoom: number;
    baselayer: string;
    fit_map_boundaries: boolean;
    icon: string;
    color: string;
  };
}

export class FilterConfigItem implements ConfigItem {
  id = 'filters';
  url: string;
  allowed_privileges: AllowedPriviledge[];
  filters:any;
}
