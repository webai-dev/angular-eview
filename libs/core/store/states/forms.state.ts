import { Form, Forms } from '@eview/core/domain/form/form';

export interface FormsState {
  forms: Forms;
}

export const initialFormsState: FormsState = {
  forms: null
};
