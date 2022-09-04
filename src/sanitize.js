import {stripHtml} from 'string-strip-html';

export function sanitize(str){
  const sanitize = stripHtml(str).result;
  return sanitize
}