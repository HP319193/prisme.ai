export interface TriggeredSchedule {
  workspaceId: string;
  automationSlug: string;
  schedule: string;
}
export interface SchedulesCallbacks {
  success(data: TriggeredSchedule): void;
  error(data: Prismeai.GenericErrorEvent['payload']): void;
}
