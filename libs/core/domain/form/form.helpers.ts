import { FormAttributes } from './form-attribute';

const SortFormAttributes = (formAttributes: FormAttributes): FormAttributes => {
  return {
    ...formAttributes,
    results: (formAttributes) ? formAttributes.results.sort((fa0, fa1) =>
      fa0.priority === fa1.priority ? 0 : fa1.priority < fa0.priority ? 1 : -1
    ) : []
  };
};

export const FormHelpers = { SortFormAttributes };
