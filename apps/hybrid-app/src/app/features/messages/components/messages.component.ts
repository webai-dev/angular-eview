import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '@eview/core/domain/messages/messages.service';
import { Messages, MessagesOptions } from '@eview/core/domain/messages/messages';
import { Subscription } from 'rxjs';
import { environment } from '@eview/core';
import { OrderSort } from '@eview/core/models/commons';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-messages',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss'],
})
export class MessagesComponent implements OnInit, OnDestroy {

  listOption: MessagesOptions;
  offset: number = 0;
   limit: number = PAGE_SIZE;
  subs: Subscription;
  messages: Messages = { count: 0, results: [] };
  format = environment.format;
  currentPage: number = 0;
  constructor(
    private messageService: MessageService,
  ) {
      this.subs = new Subscription();
  }

  ngOnInit() {
    this.listOption = {
      offset: this.offset,
      limit: this.limit,
      orderby: 'post_id',
      order: OrderSort.Desc
    }; 
    this.subs.add(
      this.messageService.list(this.listOption).subscribe((results) => {
        this.messages = results;
      })
    );
  }

  pageChanged(pageNumber) {
    this.currentPage = pageNumber;
    this.offset = (pageNumber > 0) ? (pageNumber - 1) * this.limit : 0;
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}


