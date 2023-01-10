import { Schema } from '@prisme.ai/design-system';

import Cards from './Cards';
import DataTable from './DataTable';
import Form from './Form';
import Header from './Header';
import RichText from './RichText';
import Buttons from './Buttons';
import Hero from './Hero';

const Schemas = { Cards, DataTable, Form, Header, RichText, Buttons, Hero };

const getEditSchema = (blockName: string): Schema | null =>
  Schemas[blockName as keyof typeof Schemas] || null;

export default getEditSchema;
