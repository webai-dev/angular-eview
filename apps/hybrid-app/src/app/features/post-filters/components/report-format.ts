export const FlexMonsterConfig = {
  "localization": "/assets/i18n/flexmonster-localization-en.json",
  "dataSource": {
    "data": ""
  },
  "slice": {
          "rows": [
            {
              "uniqueName": "Type d’incident"
            },
            
            {
              "uniqueName": "[Measures]"
            },
            {
              "uniqueName": "Incident status",
              "sortOrder": ["draft", "archived", "published", "responded", "evaluated"]
            }
          ],
          "reportFilters" : [
            {
              "uniqueName": "Statut de l’Incident",
              "sortOrder": ["En attente", "Non vérifié", "Vérifié", "Répondu", "Evalué"]
            }
          ],
          "columns": [
            {
              "uniqueName": "Region",
            },
            {
              "uniqueName": "[Measures]"
            }         
          ],
          "measures": [
            {
              "uniqueName": "Titre de l’incident",
              "aggregation": "count"
            }
          ],
          "expands": {
            "rows": [
              {
                "tuple": [""]
              }
            ],
            "columns": [
              {
                "tuple": [
                  ""
                ]
              }
            ]
          }
        },
  "options": {
    "viewType": "grid",
    "grid": {
      "type": "compact",
      "title": "",
      "showFilter": true,
      "showHeaders": true,
      "showTotals": true,
      "showGrandTotals": "on",
      "showHierarchies": true,
      "showHierarchyCaptions": true,
      "showReportFiltersArea": true
    },
    "configuratorActive": false,
    "configuratorButton": true,
    "showAggregations": true,
    "showEmptyValues": true,
    "showCalculatedValuesButton": true,
    "drillThrough": true,
    "showDrillThroughConfigurator": true,
    "sorting": "on",
    "datePattern": "dd/MM/yyyy",
    "dateTimePattern": "dd/MM/yyyy HH:mm:ss",
    "saveAllFormats": false,
    "showDefaultSlice": true,
    "defaultHierarchySortName": "asc",
    "showEmptyData": false,
    "showAggregationLabels": true
  },
  "formats": [
    {
      "name": "",
      "thousandsSeparator": "",
      "decimalSeparator": ".",
      "decimalPlaces": 0,
      "maxSymbols": 20,
      "currencySymbol": "",
      "currencySymbolAlign": "left",
      "nullValue": "0",
      "infinityValue": "Infinity",
      "divideByZeroValue": "Infinity"
    }
  ]
}