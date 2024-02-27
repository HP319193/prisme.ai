import { tokenize } from './tokenize';

it('should tokenize', () => {
  expect(tokenize('Foo bar', 'bar')).toEqual([
    {
      highlight: false,
      text: 'Foo ',
      start: 0,
      end: 4,
    },
    {
      highlight: true,
      text: 'bar',
      start: 4,
      end: 7,
    },
  ]);

  expect(tokenize('Bar foo bar', 'bar')).toEqual([
    {
      highlight: true,
      text: 'Bar',
      start: 0,
      end: 3,
    },
    {
      highlight: false,
      text: ' foo ',
      start: 3,
      end: 8,
    },
    {
      highlight: true,
      text: 'bar',
      start: 8,
      end: 11,
    },
  ]);

  expect(tokenize('Bar foo bar', 'groin')).toEqual([
    {
      highlight: false,
      text: 'Bar foo bar',
      start: 0,
      end: 11,
    },
  ]);

  expect(tokenize('Bar foo bar', '')).toEqual([
    {
      highlight: false,
      text: 'Bar foo bar',
      start: 0,
      end: 11,
    },
  ]);
  expect(tokenize('Exemple', 'e')).toEqual([
    {
      highlight: true,
      text: 'E',
      start: 0,
      end: 1,
    },
    {
      highlight: false,
      text: 'x',
      start: 1,
      end: 2,
    },
    {
      highlight: true,
      text: 'e',
      start: 2,
      end: 3,
    },
    {
      highlight: false,
      text: 'mpl',
      start: 3,
      end: 6,
    },
    {
      highlight: true,
      text: 'e',
      start: 6,
      end: 7,
    },
  ]);
});
it('should highlight parts', () => {
  expect(tokenize('Update on CRM', 'up crm')).toEqual([
    {
      highlight: true,
      text: 'Up',
      start: 0,
      end: 2,
    },
    {
      highlight: false,
      text: 'date on ',
      start: 2,
      end: 10,
    },
    {
      highlight: true,
      text: 'CRM',
      start: 10,
      end: 13,
    },
  ]);
});
