import '@prisme.ai/types';

export interface Workspace
  extends Pick<Prismeai.Workspace, 'owner' | 'imports'>,
    Required<Omit<Prismeai.Workspace, 'owner' | 'imports'>> {}

export interface Event<DateType extends Date | string>
  extends Omit<Prismeai.PrismeEvent, 'createdAt'> {
  createdAt: DateType;
}
