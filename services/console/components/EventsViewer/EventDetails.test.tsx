import EventDetails from './EventDetails';
import renderer, { act } from 'react-test-renderer';
import { Event } from '../../api/types';
import { FC } from 'react';
import { selectText } from '../../utils/dom';
import { Table } from '@prisme.ai/design-system';

jest.mock('@prisme.ai/design-system', () => {
  const Table: FC = ({ children }) => <div className="Table">{children}</div>;
  return {
    Table: Table,
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
  const td2 = document.createElement('td');
  tr.appendChild(td0);
  tr.appendChild(td1);
  tr.appendChild(td2);
  act(() => {
    root.root.findByType(Table).props.onRow().onClick({
      target: td0,
    });
  });
  expect(selectText).toHaveBeenCalledWith(td2);
});
