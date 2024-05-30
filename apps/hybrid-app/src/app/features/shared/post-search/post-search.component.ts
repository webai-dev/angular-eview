import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, fromEvent,throwError, Observable } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { PostService } from '@eview/core/domain/post/post.service';
import { FormHelpers } from '@eview/core/domain/form/form.helpers';
import { FormAttributes, FormAttributeType } from '@eview/core/domain/form/form-attribute';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { TagWithChildren } from '@eview/core/domain/tags/tag.helpers';

@Component({
  selector: 'eview-post-search',
  templateUrl: 'post-search.component.html'
})
export class PostSearchComponent implements OnInit {
  @Input() openModal: Observable<any>;
  @Input() isAllReports: boolean;
  @Output() onApplyClick: EventEmitter<object> = new EventEmitter();
  @Output() onCancelClick: EventEmitter<boolean> = new EventEmitter();

  subs: Subscription;
  applyDisabled: boolean = true;
  isErrorReport: boolean;
  mainPost: any;
  tagName: string;
  selectedTagId: Number;
  tag: TagWithChildren;
  formAttributes: FormAttributes;
  postTitleLabel: string;
  postTagLabel: string;
  currentPostId: number;
  @ViewChild('contentPostLink', { static: false }) mymodal: ElementRef;

  constructor(private store: Store<AppState>, 
              private postService: PostService,
              private modalService: NgbModal,) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    if (this.openModal) {
      this.openModal.subscribe((data)=> {
        if (data && data.flag) {
          this.currentPostId = data.postId;
          this.onLinkPostClicked(true);
        }
      });
    }
    this.store
      .select(selectFormAttributes)
      .subscribe(
        formAttributes => {
          this.formAttributes = FormHelpers.SortFormAttributes(formAttributes);
          this.formAttributes.results.map((attribute)=> {
            if (attribute.type === FormAttributeType.Title) {
              this.postTitleLabel = attribute.label;
            }
            if (attribute.type === FormAttributeType.Tags) {
              this.postTagLabel = attribute.label;
            }
          });
        }
      );
  }

  onPostSearch(searchPostId) {
    if (searchPostId > 0 && parseInt(searchPostId) !== this.currentPostId) {
      this.postService
        .read(searchPostId)
        .pipe(
          debounceTime(1000),
          catchError(err => {
            if (err instanceof HttpErrorResponse) {
              this.onClearClick();
              this.isErrorReport = true;
              return throwError(err);
            }
          })
        )
        .subscribe(post => {
          this.mainPost = post;
          this.store.select(selectTags).subscribe((tags) => {
            const tagObj = tags.results.filter((item) => item.id === this.mainPost.tags[0].id);
            this.tagName = tagObj[0].tag;
          })
          this.applyDisabled = false;
          if (!this.isAllReports) {
            this.applyDisabled = this.isErrorReport = !(
              post && post.parent_id === null
            );
          }
        });
    } else {
       this.onClearClick();
      this.isErrorReport = true;
      return throwError(null);
    }
  }

  initializePostSearch() {
    const searchByPostId: Element = document.getElementById('search-by-postid');
    const keyup$ = fromEvent(searchByPostId, 'keyup');
    keyup$
      .pipe(
        map((e: any) => {
          if (e !== '') {
            this.isErrorReport = false;
          }
          return e.currentTarget.value as string;
        }),
        debounceTime(500)
      )
      .subscribe(post => {
        this.onPostSearch(post);
      });
  }

  onLinkPostClicked(flag) {
    if (flag) {
      this.modalService.open(this.mymodal, { centered: true });
      this.initializePostSearch();
    }
  }

  onClearClick() {
    this.applyDisabled = true;
    this.isErrorReport = false;
    let inputValue = <HTMLInputElement>(
      document.getElementById('search-by-postid')
    );
    if (inputValue) {
      inputValue.value = '';
    }
    if (this.mainPost) {
      this.mainPost.title = '';
      this.tagName = '';
    }
  }

  onCloseClick() {
    this.isErrorReport = false;
    this.onCancelClick.emit(false);
  }

  onSubmitClick() {
    const data = {'post': this.mainPost, 'flag': true}
    this.onApplyClick.emit(data);
    this.modalService.dismissAll();
    this.onClearClick();
  }
}
