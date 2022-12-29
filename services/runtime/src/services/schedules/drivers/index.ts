import { SchedulesCallbacks } from '../types';
import { DriverType, ISchedule } from './types';
import BullMQ from './bullmq';

export default class SchedulerDriver {
  protected driver: ISchedule;

  public constructor(driverType: DriverType, callbacks: SchedulesCallbacks) {
    switch (driverType) {
      case DriverType.BullMQ:
        this.driver = new BullMQ(callbacks);
        break;
      default:
        throw new Error(`Unknown scheduler driver ${driverType}`);
    }
  }
}
