import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Popover, Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import SchemaForm from '../../../components/SchemaForm/SchemaForm';
import { useTracking } from '../../../components/Tracking';
import { useWorkspace, Workspace } from '../../../providers/Workspace';
import { useWorkspaceLayout } from '../context';
import { PAGE_TEMPLATES } from '../PageTemplates';

interface AppProps {
  children: ReactNode;
  type: string;
  path?: string;
}

function filterTemplates(
  templates: typeof PAGE_TEMPLATES,
  alreadySet: Workspace['pages'] = {}
) {
  return templates.filter(
    ({ slug }) => !Object.keys(alreadySet).includes(slug)
  );
}

export const Add = ({ children, type, path = '' }: AppProps) => {
  const { t } = useTranslation('workspaces');
  const { workspace } = useWorkspace();
  const { createAutomation, createPage, createBlock } = useWorkspaceLayout();
  const [open, setOpen] = useState(false);
  const { trackEvent } = useTracking();
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const submit = useCallback(
    async (values) => {
      let ok: boolean = false;
      setSubmitting(true);
      values.name = `${path && `${path}/`}${values.name}`;
      switch (type) {
        case 'automation':
          ok = await createAutomation(values);
          break;
        case 'page':
          const template = PAGE_TEMPLATES.find(
            ({ slug }) => slug === values.template
          );
          if (template) {
            values = { ...template };
          }
          ok = await createPage(values);
          break;
        case 'block':
          ok = await createBlock(values);
          break;
      }
      setSubmitting(false);
      if (ok) {
        setOpen(false);
      }
    },
    [createAutomation, createBlock, createPage, path, type]
  );

  const availablePageTemplates = useMemo(
    () => filterTemplates(PAGE_TEMPLATES, workspace.pages),
    [workspace.pages]
  );

  const schema = useMemo(
    () =>
      type === 'page' && availablePageTemplates.length > 0
        ? ({
            type: 'object',
            oneOf: [
              {
                title: t('pages.create.label'),
                properties: {
                  slug: {
                    type: 'string',
                    title: t(`${type}s.details.slug.label`),
                  },
                  name: {
                    type: 'localized:string',
                    title: t(`${type}s.details.name.label`),
                  },
                },
              },
              {
                title: t('pages.create.template.title'),
                properties: {
                  template: {
                    type: 'string',
                    title: t('pages.create.template.title'),
                    enum: availablePageTemplates.map(({ slug }) => slug),
                    enumNames: availablePageTemplates.map(({ slug }) =>
                      t(`pages.create.template.${slug}`)
                    ),
                  },
                },
              },
            ],
          } as Schema)
        : ({
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                title: t(`${type}s.details.slug.label`),
              },
              name: {
                type: 'localized:string',
                title: t(`${type}s.details.name.label`),
              },
            },
          } as Schema),
    [t, type]
  );

  return (
    <Popover
      titleClassName="flex m-0 pb-0 pt-4 pl-4 pr-4"
      title={({ setOpen }) => (
        <div className="flex flex-1 justify-between">
          {t(`workspace.add.${type}`)}
          <button
            onClick={() => {
              trackEvent({
                name: 'Close Details Panel by clicking button',
                action: 'click',
              });
              setOpen(false);
            }}
          >
            <CloseCircleOutlined />
          </button>
        </div>
      )}
      destroyTooltipOnHide
      content={() => (
        <div ref={containerRef} className="flex flex-1">
          <style>{`
            .add-ressource .pr-form-object {
              --pr-form-object-border: transparent
            }
            .add-ressource .pr-form-object__label {
              display: none;
            }
          `}</style>
          <SchemaForm
            schema={schema}
            onSubmit={submit}
            className="add-ressource"
            buttons={[
              <Button
                key="1"
                variant="primary"
                type="submit"
                className="self-end mr-[10px]"
                disabled={submitting}
              >
                {t(`${type}s.create.submit`)}
              </Button>,
            ]}
          />
        </div>
      )}
      overlayClassName="min-w-[50%] [&>.ant-popover-content]:-ml-[16px]"
      className="flex self-start mt-[2px]"
      placement="bottomRight"
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setTimeout(() => {
          if (!containerRef.current) return;
          const input = containerRef.current.querySelector('input');
          if (!input) return;
          input.focus();
        });
      }}
    >
      <>{children}</>
    </Popover>
  );
};

const AddController = (props: AppProps) => {
  if (props.type === 'app') {
    return <div className="flex self-start mt-[2px]">{props.children}</div>;
  }
  return <Add {...props} />;
};

export default AddController;
