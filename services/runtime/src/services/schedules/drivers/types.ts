import { DetailedTrigger } from '../../workspaces';

export interface ISchedule {
  add(schedulesTriggers: DetailedTrigger[]): Promise<any>;
  delete(workspaceId: string, automationSlug?: string): Promise<any>;
  close(): Promise<any>;
}

export enum DriverType {
  BullMQ = 'bullmq',
}
