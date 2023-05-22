import { Broker } from '@prisme.ai/broker';
import { Pages } from '..';
import { getPagesService } from '../../api/routes/pages';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager, SubjectType } from '../../permissions';
import { DSULStorage, DSULType } from '../DSULStorage';

export async function initDetailedPagesSyncing(
  accessManager: AccessManager,
  broker: Broker,
  dsulStorage: DSULStorage
) {
  const superAdmin = await getSuperAdmin(accessManager);
  const { pages } = await getPagesService({
    accessManager: superAdmin,
    broker,
    dsulStorage,
    context: {
      correlationId: 'process:syncDetailedPagesWithEDA',
      userId: 'process:syncDetailedPagesWithEDA',
      sessionId: 'process:syncDetailedPagesWithEDA',
    },
  });
  syncDetailedPagesWithEDA(superAdmin, broker, dsulStorage, pages);
}

export async function syncDetailedPagesWithEDA(
  accessManager: Required<AccessManager>,
  broker: Broker,
  dsulStorage: DSULStorage,
  pages: Pages
) {
  const rebuildDetailedPage = async (
    workspaceId: string,
    id: string,
    slug: string,
    workspaceSlug?: string,
    logCtx?: any
  ) => {
    const detailedPage = await pages.getDetailedPage({
      workspaceId,
      slug: slug!,
    });
    if (!workspaceSlug) {
      workspaceSlug = detailedPage.workspaceSlug;
    }
    await dsulStorage.save(
      {
        workspaceSlug,
        slug,
        dsulType: DSULType.DetailedPage,
      },
      detailedPage
    );
    logger.info({
      msg: `DetailedPage ${slug} (${id}) within workspace ${workspaceSlug} (${workspaceId}) succesfully updated`,
      workspaceId,
      id,
      workspaceSlug,
      slug,
      ...logCtx,
    });
  };

  broker.on(
    [
      EventType.UpdatedBlocks,
      EventType.ConfiguredApp,
      EventType.UpdatedPage,
      EventType.CreatedPage,
      EventType.PagePermissionsShared,
      EventType.PagePermissionsDeleted,
      EventType.DeletedWorkspace,
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
        },
      };
      logger.info({
        msg: `Syncing detailed pages with event ${event.type}`,
        ...logCtx,
      });
      try {
        if (event.type == EventType.UpdatedBlocks) {
          const {
            payload: { blocks, workspaceSlug },
          } = event as Prismeai.UpdatedBlocks;
          const pagesIndex = await dsulStorage.folderIndex({
            dsulType: DSULType.PagesIndex,
            workspaceId,
          });
          if (!pagesIndex) {
            return true;
          }
          for (let [slug, page] of Object.entries(pagesIndex)) {
            const needsUpdate = (page.blocks || []).some(
              (cur) => cur.slug && cur.slug in blocks
            );
            if (needsUpdate) {
              await rebuildDetailedPage(
                workspaceId!,
                page.id!,
                slug,
                workspaceSlug,
                logCtx
              );
            }
          }
        } else if (event.type == EventType.ConfiguredApp) {
          const {
            payload: { slug: appInstanceSlug },
          } = event as Prismeai.ConfiguredAppInstance;
          const pagesIndex = await dsulStorage.folderIndex({
            dsulType: DSULType.PagesIndex,
            workspaceId,
          });
          if (!pagesIndex) {
            return true;
          }
          for (let [slug, page] of Object.entries(pagesIndex)) {
            const needsUpdate = (page.blocks || []).some((cur) =>
              (cur.slug || '').startsWith(`${appInstanceSlug}.`)
            );
            if (needsUpdate) {
              await rebuildDetailedPage(
                workspaceId!,
                page.id!,
                slug,
                undefined,
                logCtx
              );
            }
          }
        } else if (
          event.type == EventType.CreatedPage ||
          event.type == EventType.UpdatedPage
        ) {
          const {
            payload: { page, oldSlug },
          } = event as Prismeai.UpdatedPage;
          await rebuildDetailedPage(
            workspaceId!,
            page.id!,
            page.slug!,
            page.workspaceSlug!,
            logCtx
          );
          if (oldSlug && page?.slug && page.slug !== oldSlug) {
            await ((pages as any).storage as DSULStorage).delete({
              workspaceSlug: page.workspaceSlug,
              slug: oldSlug,
              dsulType: DSULType.DetailedPage,
            });
          }
        } else if (
          event.type == EventType.PagePermissionsShared ||
          event.type == EventType.PagePermissionsDeleted
        ) {
          const { payload } = event as
            | Prismeai.PagePermissionsShared
            | Prismeai.PagePermissionsDeleted;
          const isOrWasPublic =
            !!(<Prismeai.PagePermissionsShared['payload']>payload).target
              ?.public ||
            (<Prismeai.PagePermissionsDeleted['payload']>payload).target?.id ==
              '*';
          if (!isOrWasPublic) {
            return false;
          }
          const page = await accessManager.get(SubjectType.Page, {
            workspaceId,
            id: payload.subjectId,
          });
          const isNowPublic = event.type == EventType.PagePermissionsShared;
          await dsulStorage.patch(
            {
              workspaceSlug: page.workspaceSlug,
              slug: page.slug,
              dsulType: DSULType.DetailedPage,
            },
            {
              public: isNowPublic,
            } as any,
            {
              mode: 'update',
              updatedBy: userId,
            }
          );
        } else if (event.type == EventType.DeletedWorkspace) {
          const {
            payload: { workspaceSlug },
          } = event as Prismeai.DeletedWorkspace;
          if (workspaceSlug) {
            await dsulStorage.delete({
              workspaceSlug: workspaceSlug,
              dsulType: DSULType.DetailedPage,
              parentFolder: true,
            });
          }
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
