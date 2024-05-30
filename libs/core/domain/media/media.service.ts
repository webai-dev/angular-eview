import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Media } from './media';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MediaService extends BaseService {
  readonly uris = {
    attach: 'media',
    read: 'media/:id'
  };

  attach(file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Media>(this.getUrl(this.uris.attach), formData);
  }

  read(id: number): Observable<Media> {

    return this.http
      .get<Media>(this.getUrl(this.uris.read.replace(':id', id.toString())))
      .pipe(
        map(res => {
          if (res && res.original_file_url) {
            res.caption = res.original_file_url.split('/').reverse()[0];
          }
          return res;
        })
      );
  }

  readContentAsBlob(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    });
  }
}
