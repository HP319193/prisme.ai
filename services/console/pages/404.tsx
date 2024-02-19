import ErrorLayout from '../layouts/Error';
import useLocalizedText from '../utils/useLocalizedText';

const locales = {
  title: {
    fr: 'Erreur 404',
  },
  description: {
    fr: 'Cette page n’existe pas, vous pouvez retourner directement à l’accueil.',
  },
};
export default function FourOhFour() {
  // Cannot use i18n in 404 case because page si statically build
  const { localize } = useLocalizedText();
  return (
    <ErrorLayout
      title={localize(locales.title)}
      description={localize(locales.description)}
    ></ErrorLayout>
  );
}
FourOhFour.isPublic = true;
