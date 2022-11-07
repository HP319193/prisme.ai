import Home from './Home';
import PublicPage, { PublicPageProps } from './PublicPage';

type IndexProps =
  | {
      type: 'home';
    }
  | ({
      type: 'page';
    } & PublicPageProps);

export const Index = ({ type, ...props }: IndexProps) => {
  switch (type) {
    case 'page':
      return <PublicPage {...(props as PublicPageProps)} />;
    case 'home':
    default:
      return <Home />;
  }
};

export default Index;
