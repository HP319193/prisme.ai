import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-final-form';
import Text from '../components/Products/Text';
import Title from '../components/Products/Title';
import { useTracking } from '../components/Tracking';
import { useUser } from '../components/UserProvider';
import AngleIcon from '../icons/angle-down.svgr';
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
    <div className="bg-products-bg flex flex-col flex-1 p-[43px]">
      <Title className="flex flex-row mb-[27px] items-center">
        <Link href="/workspaces">
          <a>
            <button>
              <AngleIcon
                className="rotate-90 mr-[12px]"
                height={23}
                width={23}
              />
            </button>
          </a>
        </Link>
        <Text className="flex pr-[205px] items-center text-[24px] font-semibold">
          {t('create.label')}
        </Text>
      </Title>
      <div className="bg-white rounded flex flex-col items-center justify-center flex-1">
        <style>{`
        .pr-form {
          display: flex;
          justify-content: center;
        }
        .pr-form * {
          font-size: 15px;
        }
        .pr-form-label {
          margin-bottom: 10px;
        }
        `}</style>
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
      </div>
    </div>
  );
};

export default CreateWorkspaces;
