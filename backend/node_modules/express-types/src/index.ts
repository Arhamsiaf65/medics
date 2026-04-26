import { Request, Response } from 'express';

export interface Query {
  query(req: Request, res: Response): void;
}
export interface Load {
  load(req: Request, res: Response): void;
}

export interface HealthController {
  check(req: Request, res: Response): void;
}
export interface LoadController {
  load(req: Request, res: Response): void;
}
export interface SearchController {
  search(req: Request, res: Response): void;
}
export interface QueryController {
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export interface GenericController extends LoadController {
  create(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  patch(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}
export interface Controller extends GenericController, SearchController {
}
export interface RateController {
  rate(req: Request, res: Response): void;
}
export interface CommentController {
  comment(req: Request, res: Response): void;
  updateComment(req: Request, res: Response): void;
  removeComment(req: Request, res: Response): void;
  getComment(req: Request, res: Response): void;
  getComments(req: Request, res: Response): void;
}
export interface ReactionController extends CommentController {
  setUseful(req: Request, res: Response): void;
  removeUseful(req: Request, res: Response): void;
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export interface SavedController {
  load(req: Request, res: Response): void;
  save(req: Request, res: Response): void;
  remove(req: Request, res: Response): void;
}
export interface FollowController {
  follow(req: Request, res: Response): void;
  unfollow(req: Request, res: Response): void;
  checkFollow(req: Request, res: Response): void;
}
export interface UserReactionController {
  react(req: Request, res: Response): void;
  unreact(req: Request, res: Response): void;
  checkReaction(req: Request, res: Response): void;
}
export interface AppreciationController {
  admire(req: Request, res: Response): void;
  respect(req: Request, res: Response): void;
  appreciate(req: Request, res: Response): void;
}
export interface UploadController {
  uploadImage(req: Request, res: Response): void;
  uploadCover(req: Request, res: Response): void;
  getGallery(req: Request, res: Response): void;
  uploadGallery(req: Request, res: Response): void;
  updateGallery(req: Request, res: Response): void;
  deleteGalleryFile(req: Request, res: Response): void;
  addExternalResource(req: Request, res: Response): void;
  deleteExternalResource(req: Request, res: Response): void;
}
export interface ResponseController {
  reply(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
}

export interface HealthHandler {
  check(req: Request, res: Response): void;
}
export interface LoadHandler {
  load(req: Request, res: Response): void;
}
export interface SearchHandler {
  search(req: Request, res: Response): void;
}
export interface QueryHandler {
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export interface GenericHandler extends LoadHandler {
  create(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  patch(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}
export interface Handler extends GenericHandler, SearchHandler {
}
export interface RateHandler {
  rate(req: Request, res: Response): void;
}
export interface CommentHandler {
  comment(req: Request, res: Response): void;
  updateComment(req: Request, res: Response): void;
  removeComment(req: Request, res: Response): void;
  getComment(req: Request, res: Response): void;
  getComments(req: Request, res: Response): void;
}
export interface ReactionHandler extends CommentHandler {
  setUseful(req: Request, res: Response): void;
  removeUseful(req: Request, res: Response): void;
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export interface SavedHandler {
  load(req: Request, res: Response): void;
  save(req: Request, res: Response): void;
  unsave(req: Request, res: Response): void;
}
export interface FollowHandler {
  follow(req: Request, res: Response): void;
  unfollow(req: Request, res: Response): void;
  checkFollow(req: Request, res: Response): void;
}
export interface AppreciationHandler {
  admire(req: Request, res: Response): void;
  respect(req: Request, res: Response): void;
  appreciate(req: Request, res: Response): void;
}
export interface UploadHandler {
  uploadImage(req: Request, res: Response): void;
  uploadCover(req: Request, res: Response): void;
  getGallery(req: Request, res: Response): void;
  uploadGallery(req: Request, res: Response): void;
  updateGallery(req: Request, res: Response): void;
  deleteGalleryFile(req: Request, res: Response): void;
  addExternalResource(req: Request, res: Response): void;
  deleteExternalResource(req: Request, res: Response): void;
}
export interface ResponseHandler {
  reply(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
}

export interface HealthHandler {
  check(req: Request, res: Response): void;
}
export interface LoadHandler {
  load(req: Request, res: Response): void;
}
export interface SearchHandler {
  search(req: Request, res: Response): void;
}
export interface QueryHandler {
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export interface GenericHandler extends LoadHandler {
  create(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  patch(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}
export interface Handler extends GenericHandler, SearchHandler {
}
export interface RateHandler {
  rate(req: Request, res: Response): void;
}
export interface CommentHandler {
  comment(req: Request, res: Response): void;
  updateComment(req: Request, res: Response): void;
  removeComment(req: Request, res: Response): void;
  getComment(req: Request, res: Response): void;
  getComments(req: Request, res: Response): void;
}
export interface ReactionHandler extends CommentHandler {
  setUseful(req: Request, res: Response): void;
  removeUseful(req: Request, res: Response): void;
  search(req: Request, res: Response): void;
  load(req: Request, res: Response): void;
}
export interface SavedHandler {
  load(req: Request, res: Response): void;
  save(req: Request, res: Response): void;
}
export interface FollowHandler {
  follow(req: Request, res: Response): void;
  unfollow(req: Request, res: Response): void;
}
export interface AppreciationHandler {
  admire(req: Request, res: Response): void;
  respect(req: Request, res: Response): void;
  appreciate(req: Request, res: Response): void;
}
export interface UploadHandler {
  uploadImage(req: Request, res: Response): void;
  uploadCover(req: Request, res: Response): void;
  getGallery(req: Request, res: Response): void;
  uploadGallery(req: Request, res: Response): void;
  updateGallery(req: Request, res: Response): void;
  deleteGalleryFile(req: Request, res: Response): void;
  addExternalResource(req: Request, res: Response): void;
  deleteExternalResource(req: Request, res: Response): void;
}
export interface ResponseHandler {
  reply(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
}
