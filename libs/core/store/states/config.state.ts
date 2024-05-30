import { Config } from '@eview/core/models/config';

export interface ConfigState {
  config: Config;
}

export const initialConfigState: ConfigState = {
  config: null
};
