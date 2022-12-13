import { SCHEDULES } from '../../../config/schedules';
import { DetailedTrigger } from '../workspaces';
import SchedulerDriver from './drivers';
import { DriverType } from './drivers/types';
import { SchedulesCallbacks } from './types';

export class Scheduler extends SchedulerDriver {
  constructor(callbacks: SchedulesCallbacks) {
    super(SCHEDULES.type as DriverType, callbacks);
  }

  async launch(
    workspaceId: string,
    automationSlug: string,
    schedules: string[]
  ) {
    try {
      await this.delete(workspaceId, automationSlug);
    } finally {
      const detailedSchedules = schedules.map(
        (schedule) =>
          ({
            type: 'schedule',
            value: schedule,
            automationSlug,
            workspace: { id: workspaceId },
          } as DetailedTrigger)
      );

      return await this.add(detailedSchedules);
    }
  }

  async add(schedules: DetailedTrigger[]) {
    return await this.driver.add(schedules);
  }

  async delete(workspaceId: string, automationSlug?: string) {
    return await this.driver.delete(workspaceId, automationSlug);
  }

  async close() {
    return await this.driver.close();
  }
}
