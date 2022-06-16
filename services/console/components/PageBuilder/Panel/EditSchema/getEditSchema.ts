import { Schema } from '@prisme.ai/design-system';

import Cards from './Cards';
import DataTable from './DataTable';
import Development from './Development';
import Form from './Form';
import Header from './Header';

const getEditSchema = (blockName: string): Schema | null => {
  switch (blockName) {
    case 'Cards':
      return Cards as Schema;
    case 'DataTable':
      return DataTable as Schema;
    case 'Development':
      return Development as Schema;
    case 'Form':
      return Form as Schema;
    case 'Header':
      return Header as Schema;
    default:
      return null;
  }
};

export default getEditSchema;
