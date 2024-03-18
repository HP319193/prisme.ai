import { cleanSearch } from '../../utils/filterUtils';

interface Token {
  highlight: boolean;
  text: string;
  start: number;
  end: number;
}

export function tokenize(from: string, search: string) {
  if (!search) {
    return [
      {
        highlight: false,
        text: from,
        start: 0,
        end: from.length,
      },
    ];
  }
  const matches = search
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((part) =>
      Array.from(
        `${from}`
          .toLowerCase()
          .matchAll(new RegExp(`${cleanSearch(part.toLowerCase())}`, 'g'))
      )
    );

  const highlights: Token[] = matches.map((match) => ({
    highlight: true,
    text: from.substring(
      match.index || 0,
      (match.index || 0) + `${match}`.length
    ),
    start: match.index || 0,
    end: (match.index || 0) + `${match}`.length,
  }));

  const output: Token[] = [];
  Array.from(from).forEach((char, index) => {
    const prev = output[output.length - 1];

    const start = prev ? prev.end : 0;

    const highlighted = highlights.find(({ start: s }) => start === s);
    if (highlighted) {
      output.push(highlighted);
      return;
    }
    const nextHighlighted = highlights.find(({ start: s }) => s > start);
    const end = nextHighlighted ? nextHighlighted.start : from.length;
    const text = from.substring(start, end);
    if (!text) return;
    output.push({
      highlight: false,
      text,
      start,
      end,
    });
  });

  return output;
}
