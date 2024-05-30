import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tags, Tag } from './tag';

@Injectable({
  providedIn: 'root'
})
export class TagService extends BaseService {
  readonly uris = {
    create: 'tags',
    list: 'tags',
    read: 'tags/:id',
    update: 'tags/:id',
    delete: 'tags/:id'
  };

  create(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(this.getUrl(this.uris.create), tag);
  }

  list(): Observable<Tags> {
    return this.http.get<Tags>(this.getUrl(this.uris.list)).pipe(
      catchError(err => {
          return this.cacheHandler(err, 'tags');
      })
    );
  }

  read(id: number): Observable<Tag> {
    return this.http.get<Tag>(
      this.getUrl(this.uris.read).replace(':id', id.toString())
    );
  }

  update(tag: Tag): Observable<Tag> {
    return this.http.put<Tag>(
      this.getUrl(this.uris.update).replace(':id', tag.id.toString()),
      tag
    );
  }

  delete(tag: { id: number }): Observable<Tag> {
    return this.http.delete<Tag>(
      this.getUrl(this.uris.delete).replace(':id', tag.id.toString())
    );
  }
}
