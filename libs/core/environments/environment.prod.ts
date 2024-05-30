export const environment = {
  production: true,
  api: {
    base: 'https://api.cei.ewer.app',
    version: 'v3'
  },
  authentication: {
    client_id: 'ushahidiui',
    client_secret: '35e7f0bca957836d05ca0492211b0ac707671261',
    token_header: 'authorization'
  },
  ngHttpLoaderConfig: {
    backdrop: true,
    backgroundColor: '#000000',
    debounceDelay: 100,
    extraDuration: 500,
    minDuration: 500,
    opacity: 0.5,
    spinner: 'skWanderingCubes',
    filteredUrlPatterns: ['open.mapquestapi.com', 'notifications_ex', 'exports/jobs/']
  },
  deploymentName: 'ewer.app',
  footer: {
    visible: false,
    text: 'All rights reserved EC-UNDP Joint Task Force',
    links: [
      {
        text: 'Terms of use',
        link: ''
      },
      {
        text: 'Privacy Policy',
        link: ''
      }
    ]
  },
  map: {
    shapeFiles: [
      {
       uri: 'assets/shapefiles/shapefiles.zip',
       config: [
         {
           fileName: 'LIMITE_REGION',
           altName: 'Region',
           
         },
         {
           fileName: 'LIMITE_DEPARTEMENT',
           altName: 'Department',
           options: {
             style: {
               color: 'green',
               opacity: '1',
               weight: '0.5'
             }
           },
         },
         {
           fileName: 'LIMITE_SOUS_PREFECTURE',
           altName: 'Sous prefectures',
           base: true,
           selected: true,
           options: {
             style: {
               color: 'gray',
               opacity: '1',
               weight: '0.5'
             }
           },
           listenForClick: {
             enabled: true,
             dispatchProperties: true
           }
         }, 
         
       ]
     }
   ]
  },
  format: {
    date: 'DD/MM/YYYY',
    time: 'HH:mm:ss',
    dateTime: 'DD/MM/YYYY HH:mm:ss',
    dateTimeWithoutSec: 'DD/MM/YYYY HH:mm'
  },
  form: {
    id: 1
  },
  geocoding: {
    provider: 'mapquest',
    mapquest: {
      url: 'https://open.mapquestapi.com/nominatim/v1/search.php',
      key: 'u1eKB28V0nFccp8v96q3Yt8ihTJVAo5P'
    }
  },
  defaults: {
    tagColor: '#4282c2',
    tagIcon: 'fa fa-map-marker'
  },
  notifications: {
    enabled: true,
    timing: 900
  },
  countryCodes: [
    {
      countryCode: 'fr',
      countryLanguage: 'French'
    }
  ],
  availableLanguages:[
    "fr",
  ],
  defaultLanguage: "fr",
  defaultCountryCode: 'CI',
  app_state_key: 'app_storage',
  xAxisLabel: 'Report dates',
  yAxisLabel: 'No of reports',
  flexmonster:{
    licenseKey : 'Z7MG-XG891F-3S0H35-5F0R3N-1Y4X4K-6H655R-291P4J-0P0V1V-5K4K'    
  },
  export: {
    timing: 5,
    expoerted_file_name: 'Reports.csv'
  }
};
