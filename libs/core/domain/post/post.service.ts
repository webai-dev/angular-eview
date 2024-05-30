import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { FormValue } from '../form/form-value';
import { Post, Posts, ListPostOptions, FilterOptions } from './post';
import { GeoJsonObject } from './geo-json';
import { PostComments, PostComment, PostCommentType } from './post-comment';
import { OrderSort } from '@eview/core/models/commons';

@Injectable({
  providedIn: 'root'
})
export class PostService extends BaseService {
  readonly uris = {
    create: 'posts',
    list: 'posts',
    listPostsCount: 'posts/analysis',
    read: 'posts/:id',
    update: 'posts/:id',
    delete: 'posts/:id',
    geoJson: 'posts/geojson',
    audit: 'posts/:id/audit?offset=0&limit=20',
    listComments: 'posts/:post_id/comments',
    listCommentsByType: 'posts/:post_id/comments/:type',
    createComment: 'posts/:post_id/comments',
    updateComment: 'posts/:post_id/comments/:id',
    deleteComment: 'posts/:post_id/comments/:id'
  };

  create(formValue: FormValue): Observable<Post> {
    return this.http.post<Post>(this.getUrl(this.uris.create), formValue);
  }

  list(options: ListPostOptions): Observable<Posts> {
    options.orderby = 'id';
    options.order =  OrderSort.Desc;
    return this.http.get<Posts>(this.getUrl(this.uris.list), {
      params: super.getParamsFromObject(options)
    });
  }

  read(id: number): Observable<Post> {
    return this.http.get<Post>(
      this.getUrl(this.uris.read).replace(':id', id.toString())
    );
  }

  update(post: Post): Observable<Post> {
    return this.http.put<Post>(
      this.getUrl(this.uris.update).replace(':id', post.id.toString()),
      post
    );
  }

  delete(post: Post): Observable<Post> {
    return this.http.delete<Post>(
      this.getUrl(this.uris.update).replace(':id', post.id.toString())
    );
  }

  geoJson(options: ListPostOptions): Observable<GeoJsonObject> {
    return this.http.get<GeoJsonObject>(this.getUrl(this.uris.geoJson), {
      params: super.getParamsFromObject(options)
    });
  }

  listComments(
    post_id: number,
    type: PostCommentType = null
  ): Observable<PostComments> {
    const url = this.getUrl(
      type !== null ? this.uris.listCommentsByType : this.uris.listComments
    )
      .replace(':post_id', post_id.toString())
      .replace(':type', type > 0 ? type.toString() : '0');
    return this.http.get<PostComments>(url);
  }

  createComment(comment: PostComment): Observable<PostComment> {
    return this.http.post<PostComment>(
      this.getUrl(this.uris.createComment).replace(
        ':post_id',
        comment.post_id.toString()
      ),
      comment
    );
  }

  updateComment(comment: PostComment): Observable<PostComment> {
    return this.http.put<PostComment>(
      this.getUrl(this.uris.updateComment)
        .replace(':post_id', comment.post_id.toString())
        .replace(':id', comment.id.toString()),
      comment
    );
  }

  deleteComment(comment: PostComment): Observable<void> {
    return this.http.delete<void>(
      this.getUrl(this.uris.deleteComment)
        .replace(':post_id', comment.post_id.toString())
        .replace(':id', comment.id.toString())
    );
  }

  getPostAudit(id: number) {
    return this.http.get<any>(
      this.getUrl(this.uris.audit).replace(':id', id.toString())
    );
  }

  getPostByFilters(options: FilterOptions) : Observable<any> {
    return this.http.post<FilterOptions>(
      this.getUrl(this.uris.listPostsCount),
      options
    );
  }
}
