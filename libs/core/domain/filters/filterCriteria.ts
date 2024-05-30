export interface FilterCriteria {
  management_level?: string,
  startDate?: Date,
  endDate?: Date,
  region?: string,
  woreda?: string,
  duration?: string,
  category?: string,
  format?: string,
  reportConfig?: any,
  title?: string;
  isDelete?: boolean;
  isReport?: boolean;
  isMapShow?: boolean;
  formId?: number;
}

export enum FormFields {
  TITLE = 'Titre de l’incident',
  DATE = 'Date/Heure',
  MEANS = 'Instruments',
  INCIDENT_STATUS = 'Statut de l’Incident',
  STATUS = 'Statut',
  REGION = 'Region',
  ZONE = 'District',
  WOREDA = 'Département',
  SOURCE_OF_INFO = 'Source d’information',
  TARGET = 'Cible',
  PRIORITY = 'Définir la Priorité',
  TYPE_OF_INCIDENT = 'Type d’incident',
  PERPETRATORS = 'Responsables',
  PERPETRATORS_II = 'Responsables II',
  ARE_WOMEN_MAIN_TARGET = 'Les femmes sont-elles la cible principale',
  CASUALTY = 'Nombre de victimes'
} 

export interface ReportRecordType {
  fields: FormFields;  
}