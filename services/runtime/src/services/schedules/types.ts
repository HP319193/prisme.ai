export interface SchedulesCallbacks {
  success(data: Prismeai.TriggeredSchedule['payload']): void;
  error(data: Prismeai.GenericErrorEvent['payload']): void;
}
