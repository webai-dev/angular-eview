import { Form } from './form';

export interface FormValue {
  title?: string;
  content?: string;
  values?: {};
  form: Form;
  mgmt_lev_1?: string;
  mgmt_lev_2?: string;
  mgmt_lev_3?: string;
}
