import EventDetails from './EventDetails';
import renderer, { act } from 'react-test-renderer';
import { Event } from '../../api/types';
import { FC } from 'react';
import { DataTable } from 'primereact/datatable';
import { selectText } from '../../utils/dom';

jest.mock('primereact/datatable', () => {
  const DataTable: FC = ({ children }) => (
    <div className="DataTable">{children}</div>
  );
  return {
    DataTable,
  };
});
jest.mock('primereact/column', () => {
  const Column: FC = ({ children, ...props }) => (
    <div className="Column">{JSON.stringify(props)}</div>
  );
  return {
    Column,
  };
});
jest.mock('../../utils/dom', () => {
  const mock = jest.fn();
  return {
    selectText: mock,
  };
});

jest.mock('../../utils/dates', () => {
  const mock = jest.fn();
  return {
    useDateFormat: () => mock,
  };
});

const event: Event<Date> = {
  id: '1',
  createdAt: new Date('2022-01-01'),
  type: 'foo',
  source: {
    correlationId: '2',
    host: {
      service: 'acme',
    },
  },
};

it('should render', () => {
  const root = renderer.create(<EventDetails {...event} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should select on row click', () => {
  const root = renderer.create(<EventDetails {...event} />);

  const tr = document.createElement('tr');
  const td0 = document.createElement('td');
  const td1 = document.createElement('td');
  tr.appendChild(td0);
  tr.appendChild(td1);
  act(() => {
    root.root.findByType(DataTable).props.onRowClick({
      originalEvent: {
        target: td0,
      },
    });
  });
  expect(selectText).toHaveBeenCalledWith(td1);
});
