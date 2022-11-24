import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { DSULStorage, DSULType } from '../dsulStorage';

export async function initRuntimeModelsSyncing(
  broker: Broker,
  dsulStorage: DSULStorage
) {
  broker.on(
    [
      EventType.UpdatedWorkspace,

      EventType.CreatedAutomation,
      EventType.UpdatedAutomation,
      EventType.DeletedAutomation,

      EventType.InstalledApp,
      EventType.UninstalledApp,
      EventType.ConfiguredApp,
    ],
    async (event) => {
      const {
        source: { workspaceId, userId, correlationId },
      } = event;

      const logCtx = {
        event: {
          id: event.id,
          type: event.type,
          correlationId,
          workspaceId,
          userId,
        },
      };
      logger.info({
        msg: `Syncing runtime model with event ${event.type}`,
        ...logCtx,
      });
      try {
        let currentModel = await dsulStorage.get(
          {
            dsulType: DSULType.RuntimeModel,
            workspaceId,
          },
          false
        );
        // First time : initialise it with base index
        if (!currentModel) {
          currentModel = await dsulStorage.get({
            dsulType: DSULType.DSULIndex,
            workspaceId,
          });
        }

        let updatedModel: Prismeai.RuntimeModel | undefined = undefined;
        if (event.type == EventType.UpdatedWorkspace) {
          const { workspace } =
            event.payload as Prismeai.UpdatedWorkspace['payload'];
          updatedModel = {
            ...currentModel,
            ...workspace,
          };
        } else if (
          event.type == EventType.CreatedAutomation ||
          event.type == EventType.UpdatedAutomation
        ) {
          const { automation, slug, oldSlug } =
            event.payload as Prismeai.UpdatedAutomation['payload'];
          updatedModel = {
            ...currentModel,
            automations: {
              ...currentModel.automations,
              [slug]: automation,
            },
          };
          if (oldSlug && updatedModel?.automations?.[oldSlug]) {
            delete updatedModel.automations[oldSlug];
          }
        } else if (event.type == EventType.DeletedAutomation) {
          const { automationSlug } =
            event.payload as Prismeai.DeletedAutomation['payload'];
          updatedModel = {
            ...currentModel,
            automations: {
              ...currentModel.automations,
            },
          };
          delete updatedModel.automations?.[automationSlug];
        } else if (
          event.type == EventType.InstalledApp ||
          event.type == EventType.ConfiguredApp
        ) {
          const { appInstance, slug, oldSlug } =
            event.payload as Prismeai.ConfiguredAppInstance['payload'];
          delete appInstance.oldConfig;
          updatedModel = {
            ...currentModel,
            imports: {
              ...currentModel.imports,
              [slug]: appInstance,
            },
          };
          if (oldSlug && updatedModel.imports?.[oldSlug]) {
            delete updatedModel.imports[oldSlug];
          }
        } else if (event.type == EventType.UninstalledApp) {
          const { slug } =
            event.payload as Prismeai.UninstalledAppInstance['payload'];
          updatedModel = {
            ...currentModel,
            imports: {
              ...currentModel.imports,
            },
          };
          delete updatedModel.imports?.[slug];
        }

        if (updatedModel) {
          await dsulStorage.save(
            {
              dsulType: DSULType.RuntimeModel,
              workspaceId,
            },
            updatedModel
          );
        }
      } catch (err) {
        logger.error({ err, ...logCtx });
        return false;
      }

      return true;
    },
    {}
  );
}
