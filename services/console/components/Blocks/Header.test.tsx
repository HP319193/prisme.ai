import Header from './Header';
import renderer from 'react-test-renderer';

jest.mock('@prisme.ai/design-system', () => {
  const mock = {
    config: {
      title: 'Hello',
      logo: {
        src: 'http://img/age.png',
        alt: 'hello logo',
      },
      nav: [
        {
          text: 'Home',
          type: 'external',
          value: 'https://prisme.ai',
        },
        {
          text: 'Another page',
          type: 'internal',
          value: 'j8ksz9',
        },
        {
          text: 'Scroll',
          type: 'inside',
          value: 'section_1',
        },
        {
          text: 'Contact',
          type: 'event',
          value: 'displayContactForm',
        },
      ],
    },
  };
  return {
    useBlock: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(<Header />);
  expect(root.toJSON()).toMatchSnapshot();
});
