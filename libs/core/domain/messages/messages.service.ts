import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { Message, MessagesOptions, Messages } from './messages';


@Injectable({
  providedIn: 'root'
})

export class MessageService extends BaseService {


  readonly uris = {
    create: 'messages',
    list: 'messages',
    read: 'messages/id',
    readByPost: 'messages/:id/post',
    update: 'messages/:id',
  };

  create(formValue: Message): Observable<Message> {
    return this.http.post<Message>(this.getUrl(this.uris.create), formValue);
  }

  list(options: MessagesOptions): Observable<Messages> {
    return this.http.get<Messages>(this.getUrl(this.uris.list), {
      params: super.getParamsFromObject(options)
    });
  }

  read(id: number): Observable<Message> {
    return this.http.get<Message>(
      this.getUrl(this.uris.read).replace(':id', id.toString())
    );
  }

  update(post: Message): Observable<Message> {
    return this.http.put<Message>(
      this.getUrl(this.uris.update).replace(':id', post.id.toString()),
      post
    );
  }  
}
