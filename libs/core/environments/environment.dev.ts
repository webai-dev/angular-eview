export const environment = {
  production: false,
  api: {
    base: 'https://dev-ceici-ewer-api.unicc.biz',
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
  deploymentName: 'ceci.app',
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
    licenseKey : 'Z791-XHFI1D-355N06-606P04-181K48-6G5T2J-5M3Q39-1H2I49-640O11-644628-3F0J5H-3N'    
  },
  export: {
    timing: 5,
    expoerted_file_name: 'Reports.csv'
  }
};
