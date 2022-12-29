import renderer from 'react-test-renderer';
import Item from './Item';

jest.mock(
  'next/link',
  () =>
    function Link(props: any) {
      return <div id="next/link" {...props} />;
    }
);

jest.mock('next/router', () => {
  const mock = {
    asPath: '/foo/bar',
  };
  return {
    useRouter: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(
    <Item href="/foo" icon={<div>Icon</div>}></Item>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render selected', () => {
  const root = renderer.create(
    <Item href="/foo/bar" icon={<div>Icon</div>}></Item>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
