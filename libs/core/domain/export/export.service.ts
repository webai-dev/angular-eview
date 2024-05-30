import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExportJobs, ExportJobRequest, ExportJob } from './export';
import { BaseService } from '@eview/core/base/base-service';

@Injectable({
  providedIn: 'root'
})
export class ExportService extends BaseService {
  readonly uris = {
    createJob: `exports/jobs`,
    readJob: 'exports/jobs/:id',
    listJobs: `exports/jobs`
  };

  createJob(request: ExportJobRequest): Observable<ExportJob> {
    return this.http.post<ExportJob>(this.getUrl(this.uris.createJob), request);
  }

  readJob(id: number): Observable<ExportJob> {
    return this.http.get<ExportJob>(
      this.getUrl(this.uris.readJob).replace(':id', id.toString())
    );
  }

  listJobs(): Observable<ExportJobs> {
    return this.http.get<ExportJobs>(this.getUrl(this.uris.listJobs));
  }
}
