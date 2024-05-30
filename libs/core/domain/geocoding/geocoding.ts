export enum Provider {
  MapQuest = 'mapquest'
}

export interface MapQuestForwardResponse {
  info: {
    statuscode: number;
    copyright: {
      text: string;
      imageUrl: string;
      imageAltText: string;
    };
    messages: any[];
  };
  options: {
    maxResults: number;
    thumbMaps: boolean;
    ignoreLatLngInput: boolean;
  };
  results: {
    providedLocation: {
      location: string;
    };
    locations: {
      street: string;
      adminArea6: string;
      adminArea6Type: string;
      adminArea5: string;
      adminArea5Type: string;
      adminArea4: string;
      adminArea4Type: string;
      adminArea3: string;
      adminArea3Type: string;
      adminArea1: string;
      adminArea1Type: string;
      postalCode: string;
      geocodeQualityCode: string;
      geocodeQuality: string;
      dragPoint: boolean;
      sideOfStreet: string;
      linkId: string;
      unknownInput: string;
      type: string;
      latLng: {
        lat: number;
        lng: number;
      };
      displayLatLng: {
        lat: number;
        lng: number;
      };
      mapUrl: string;
    }[];
  }[];
}

export enum MapQuestQualityCode {
  Address = 'ADDRESS',
  City = 'CITY',
  Country = 'COUNTRY',
  County = 'COUNTY',
  Intersection = 'INTERSECTION',
  Neighborhood = 'NEIGHBORHOOD',
  Point = 'POINT',
  State = 'STATE',
  Street = 'STREET',
  Zip = 'ZIP',
  ZipExtended = 'ZIP_EXTENDED'
}
