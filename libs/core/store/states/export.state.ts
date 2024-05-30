import { ExportJobRequest, ExportJob } from '@eview/core/domain/export/export';

export interface ExportState {
  jobs: {
    last: ExportJob;
    timer?: number;
  };
}

export const initialExportState: ExportState = {
  jobs: null
};
