import { Schema } from '@prisme.ai/design-system';

import Cards from './Cards';
import DataTable from './DataTable';
import Development from './Development';
import Form from './Form';
import Header from './Header';

const getEditSchema = (blockName: string): Schema['properties'] | null => {
  switch (blockName) {
    case 'Cards':
      return Cards as Schema['properties'];
    case 'DataTable':
      return DataTable as Schema['properties'];
    case 'Development':
      return Development as Schema['properties'];
    case 'Form':
      return Form as Schema['properties'];
    case 'Header':
      return Header as Schema['properties'];
    default:
      return null;
  }
};

export default getEditSchema;
