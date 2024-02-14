import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-final-form';
import SingleViewLayout from '../components/Products/SingleViewLayout';
import { useTracking } from '../components/Tracking';
import { useUser } from '../components/UserProvider';
import { useWorkspaces } from '../providers/Workspaces';

const SubmitButton = ({ ...props }: ButtonProps) => {
  const { getState } = useForm();
  const { hasValidationErrors } = getState();
  const { creating } = useWorkspaces();

  return (
    <Button
      variant="primary"
      type="submit"
      disabled={hasValidationErrors || creating}
      className="self-center !h-auto font-bold py-[10px] px-[30px] mt-[50px] !text-[20px] !font-bold"
      {...props}
    />
  );
};

export const CreateWorkspaces = () => {
  const { t } = useTranslation('workspaces');
  const { createWorkspace, creating } = useWorkspaces();
  const { trackEvent } = useTracking();
  const { replace } = useRouter();
  const { user } = useUser();

  const schema = useMemo(
    () =>
      ({
        type: 'object',
        properties: {
          name: {
            type: 'localized:string',
            title: t('workspace.create.name'),
            validators: {
              required: true,
            },
          } as Schema,
          description: {
            type: 'localized:string',
            title: t('workspace.create.description'),
            'ui:widget': 'textarea',
            validators: {
              required: true,
            },
          } as Schema,
          photo: {
            type: 'string',
            title: t('workspace.create.photo'),
            'ui:widget': 'upload',
            validators: {
              required: true,
            },
          } as Schema,
        },
      } as Schema),
    [t]
  );

  const submit = useCallback(
    async (values: any) => {
      if (creating) return;
      const created = await createWorkspace(values);
      trackEvent({
        name: 'Create new Workspace',
        category: 'Workspaces',
        action: 'click',
        value: {
          workspaceId: created.id,
          workspace: created,
          userId: user?.id,
        },
      });
      replace(`/workspaces/${created.id}`);
    },
    [createWorkspace, creating, replace, trackEvent, user?.id]
  );

  return (
    <SingleViewLayout title={t('create.label')} backLink="/workspaces">
      <SchemaForm
        schema={schema}
        buttons={[
          <SubmitButton key="submit">
            {t('workspace.create.submit')}
          </SubmitButton>,
        ]}
        onSubmit={submit}
        autoFocus
      />
    </SingleViewLayout>
  );
};

export default CreateWorkspaces;
