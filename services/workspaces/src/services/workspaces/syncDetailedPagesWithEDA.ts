import { Broker } from '@prisme.ai/broker';
import { getPagesService } from '../../api/routes/pages';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import { getSuperAdmin, AccessManager, SubjectType } from '../../permissions';
import DSULStorage, { DSULType } from '../DSULStorage';

export async function syncDetailedPagesWithEDA(
  accessManager: AccessManager,
  broker: Broker,
  dsulStorage: DSULStorage
) {
  const superAdmin = await getSuperAdmin(accessManager);
  const { pages } = getPagesService({
    accessManager: superAdmin,
    broker,
    dsulStorage,
    context: {
      correlationId: 'process:syncDetailedPagesWithEDA',
      userId: 'process:syncDetailedPagesWithEDA',
      sessionId: 'process:syncDetailedPagesWithEDA',
    },
  });

  const rebuildDetailedPage = async (
    workspaceId: string,
    id: string,
    slug: string,
    workspaceSlug?: string
  ) => {
    const detailedPage = await pages.getDetailedPage({
      workspaceId,
      id,
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
    logger.info(
      `DetailedPage ${slug} (${id}) within workspace ${workspaceSlug} (${workspaceId}) succesfully updated`,
      {
        workspaceId,
        id,
        workspaceSlug,
        slug,
      }
    );
  };

  broker.on(
    [
      EventType.UpdatedWorkspace,
      EventType.UpdatedBlocks,
      EventType.ConfiguredApp,
      EventType.UpdatedPage,
      EventType.CreatedPage,
      EventType.PagePermissionsShared,
      EventType.PagePermissionsDeleted,
    ],
    async (event) => {
      const {
        source: { workspaceId, userId },
      } = event;

      try {
        if (event.type == EventType.UpdatedWorkspace) {
          const {
            payload: { workspace, oldSlug },
          } = event as Prismeai.UpdatedWorkspace;
          if (workspace.slug && oldSlug) {
            await dsulStorage.copy(
              {
                workspaceSlug: oldSlug,
                dsulType: DSULType.DetailedPage,
                parentFolder: true,
              },
              {
                workspaceSlug: workspace.slug,
                dsulType: DSULType.DetailedPage,
                parentFolder: true,
              }
            );
            await dsulStorage.delete({
              workspaceSlug: oldSlug,
              dsulType: DSULType.DetailedPage,
              parentFolder: true,
            });
          }
        } else if (event.type == EventType.UpdatedBlocks) {
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
                workspaceSlug
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
              await rebuildDetailedPage(workspaceId!, page.id!, slug);
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
            page.workspaceSlug!
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
            !!(<Prismeai.PagePermissionsShared['payload']>payload).permissions
              ?.public ||
            (<Prismeai.PagePermissionsDeleted['payload']>payload).userId == '*';
          if (!isOrWasPublic) {
            return false;
          }
          const page = await superAdmin.get(SubjectType.Page, {
            workspaceId,
            id: payload.subjectId,
          });
          const isNowPublic = event.type == EventType.PagePermissionsShared;
          await ((pages as any).storage as DSULStorage).patch(
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
        }
      } catch (error) {
        logger.error(error);
        return false;
      }

      return true;
    },
    {}
  );
}
