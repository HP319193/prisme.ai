import Form from '../components/SchemaForm/Form';
import { Collapse } from '@prisme.ai/design-system';
import { ReactElement, useMemo } from 'react';

const AppsSidebarItem = ({
  slug,
  config: { schema, value, widget } = {},
}: Prismeai.AppInstance) => {
  const configComponent: ReactElement | null = useMemo(() => {
    if (schema) {
      console.log('schema', schema);
      return <Form schema={schema} onSubmit={() => {}} initialValues={value} />;
    }
    return null;
    // if (widget) {
    //   // return widget;
    //   return <div>here will be widget</div>;
    // }
    // return null;
  }, [schema, value, widget]);

  return (
    <Collapse
      light
      key={slug}
      items={[
        {
          label: `${slug}`,
          content: configComponent,
        },
      ]}
    />
  );
};

export default AppsSidebarItem;
