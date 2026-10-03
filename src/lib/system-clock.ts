import type { Clock } from './ports';
export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
