import prefixCSS from './prefixCSS';
import fs from 'fs';

it('should prefix css', () => {
  expect(
    prefixCSS(
      `
  .some-class {
    color: red;
  }
  `,
      '.prefix'
    )
  ).toBe(`.prefix .some-class {
  color: red;
}`);
});

it('should replace :block', () => {
  expect(
    prefixCSS(
      `
  .some-class {
    color: red;
  }
  :block {
    color: green;
  }
  :block div {
    color: orange;
  }
  `,
      '.prefix'
    )
  ).toBe(`.prefix .some-class {
  color: red;
}

.prefix {
  color: green;
}

.prefix div {
  color: orange;
}`);
});

it('should work with a big css content', () => {
  const css = fs.readFileSync(`${__dirname}/prefixCSS.test.css`).toString();
  const expected = fs
    .readFileSync(`${__dirname}/prefixCSS.expected.css`)
    .toString();
  expect(prefixCSS(css, '.prefix')).toBe(expected);
});

it('should parse media queries', () => {
  const css = `:block .pr-block-hero__container {
  display: flex;
  flex-direction: row;
  padding: 1rem;
  justify-content: space-between;
}

@media (max-width: 500px) {
  :block .pr-block-hero__container {
    flex-direction: column;
  }
}`;
  expect(prefixCSS(css, '.prefix')).toEqual(`.prefix .pr-block-hero__container {
  display: flex;
  flex-direction: row;
  padding: 1rem;
  justify-content: space-between;
}

@media (max-width: 500px) {
  .prefix .pr-block-hero__container {
    flex-direction: column;
  }
}`);
});
