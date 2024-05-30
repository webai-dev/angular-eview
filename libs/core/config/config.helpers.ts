import { Config, ConfigItem } from '../models/config';

import { Type } from '@angular/core';

const GetConfigItem = <T extends ConfigItem>(
  target: Type<T>,
  payload: Config = { count: 0, results: [] }
): T =>
  payload ? (payload.results.find(i => i.id === new target().id) as T) : null;

export const ConfigHelpers = {
  GetConfigItem
};
