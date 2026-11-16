import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error';
  title: string;
}


@Injectable({
    providedIn:'root'
})
export class NotificationServices {
     private subject = new BehaviorSubject<Notification | null>(null);

  notification$ = this.subject.asObservable();

  private timer: ReturnType<typeof setTimeout> | undefined;

  show(
  message: string,
  type: 'success' | 'error',
  title?: string
): void {

  if (this.timer) {
    clearTimeout(this.timer);
  }

  this.subject.next({
    message,
    type,
    title: title ?? (
      type === 'success' ? 'Success!' : 'Error!'
    )
  });

  this.timer = setTimeout(() => {
    this.subject.next(null);
    this.timer = undefined;
  }, 3000);
}
}
