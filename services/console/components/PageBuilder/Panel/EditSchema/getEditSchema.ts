import { Schema } from '@prisme.ai/design-system';

import Cards from './Cards';
import DataTable from './DataTable';
import Form from './Form';
import Header from './Header';
import RichText from './RichText';
import Buttons from './Buttons';
import Hero from './Hero';
import BlocksList from './BlocksList';
import Footer from './Footer';
import Image from './Image';
import Breadcrumbs from './Breadcrumbs';
import Action from './Action';
import TabsView from './TabsView';

const Schemas = {
  Cards,
  DataTable,
  Form,
  Header,
  RichText,
  Buttons,
  Hero,
  BlocksList,
  Footer,
  Image,
  Breadcrumbs,
  Action,
  TabsView,
};

const getEditSchema = (blockName: string): Schema | null =>
  Schemas[blockName as keyof typeof Schemas] || null;

export default getEditSchema;
