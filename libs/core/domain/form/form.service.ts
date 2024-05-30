import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormAttributes, FormAttribute } from './form-attribute';
import { Form, Forms } from './form';

@Injectable({
  providedIn: 'root'
})
export class FormService extends BaseService {
  readonly uris = {
    listAttributes: 'forms/:id/attributes',
    createAttribute: 'forms/:id/attributes/',
    updateAttribute: 'forms/:id/attributes/:faId',
    deleteAttribute: 'forms/:id/attributes/:faId',
    listForms: 'forms',
    createForm: 'forms',
    updateForm: 'forms/:id',
    deleteForm: 'forms/:id'
  };

  listForms(): Observable<Forms> {
    return this.http.get<Forms>(
      this.getUrl(this.uris.listForms)
    );
  }

  createForm(body: Form): Observable<Form> {
    return this.http.post<Form>(
      this.getUrl(this.uris.createForm),
      body
    );
  }

  updateForm(id: number, body: Form): Observable<Form> {
    return this.http.put<Form>(
      this.getUrl(this.uris.updateForm).replace(':id', id.toString()),
      body
    );
  }

  deleteForm(id: number): Observable<Form> {
    return this.http.delete<Form>(
      this.getUrl(this.uris.deleteForm).replace(':id', id.toString())
    );
  }

  listAttributes(id: number): Observable<FormAttributes> {
    return this.http.get<any>(
      this.getUrl(this.uris.listAttributes).replace(':id', id.toString())
    ).pipe(
      catchError(err => {
        return this.cacheHandler(err, 'formAttributes');
      })
    );
  }

  createAttribute(
    id: number,
    attribute: FormAttribute
  ): Observable<FormAttribute> {
    return this.http.post<FormAttribute>(
      this.getUrl(this.uris.listAttributes).replace(':id', id.toString()),
      attribute
    );
  }

  updateAttribute(
    id: number,
    attribute: FormAttribute
  ): Observable<FormAttribute> {
    return this.http.put<FormAttribute>(
      this.getUrl(this.uris.updateAttribute)
        .replace(':id', id.toString())
        .replace(':faId', attribute.id.toString()),
      attribute
    );
  }

  deleteAttribute(
    id: number,
    attribute: FormAttribute
  ): Observable<FormAttribute> {
    return this.http.delete<FormAttribute>(
      this.getUrl(this.uris.updateAttribute)
        .replace(':id', id.toString())
        .replace(':faId', attribute.id.toString())
    );
  }
}
