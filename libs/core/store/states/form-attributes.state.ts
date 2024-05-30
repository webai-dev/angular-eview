import { FormAttributes } from '@eview/core/domain/form/form-attribute';

export interface FormAttributesState {
  formAttributes: FormAttributes;
}

export const initialFormAttributesState: FormAttributesState = {
  formAttributes: null
};
