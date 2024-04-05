import prefixCSS, { replacePlaceholders, replaceVars } from './prefixCSS';
import fs from 'fs';

it('should prefix css', () => {
  expect(
    prefixCSS(
      `
  .some-class {
    color: red;
  }
  `,
      {
        block: '.prefix',
        parent: '.parent',
      }
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
      {
        block: '.prefix',
        parent: '.parent',
      }
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
  expect(
    prefixCSS(css, {
      block: '.prefix',
      parent: '.parent',
    })
  ).toBe(expected);
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
  expect(
    prefixCSS(css, {
      block: '.prefix',
      parent: '.parent',
    })
  ).toEqual(`.prefix .pr-block-hero__container {
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

it('should replace :parent', () => {
  expect(
    prefixCSS(
      `:parent {
  background: red;
}`,
      {
        block: '.prefix',
        parent: '.parent',
      }
    )
  ).toBe(`.parent {
  background: red;
}`);

  expect(
    prefixCSS(
      `:parent :block {
  background: red;
}`,
      {
        block: '.prefix',
        parent: '.parent',
      }
    )
  ).toBe(`.parent .prefix {
  background: red;
}`);
});

it('should not insert :block if starting with :root', () => {
  expect(
    prefixCSS(
      `:root .class {
  background: red;
}`,
      {
        block: '.prefix',
        parent: '.parent',
      }
    )
  ).toBe(`:root .class {
  background: red;
}`);
});

it('should not break webfont link', () => {
  expect(
    prefixCSS(
      `"/*@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');*/
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');

:block {
  font-family: Lato;
  font-size: 2rem;
}"
  `,
      {
        block: '.prefix',
        parent: '.parent',
      }
    )
  )
    .toBe(`"/*@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');*/
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');

:block {
  font-family: Lato;
  font-size: 2rem;
}"
  `);
});

it('should replace vars', () => {
  expect(
    replaceVars(
      `.test-{{var}} {
  
}
.test-{{autrevar}} {

}`,
      []
    )
  ).toBe(`.test-__________1 {
  
}
.test-__________2 {

}`);
});
it('should replace placeholders', () => {
  expect(
    replacePlaceholders(
      `.test-__________1 {
  
}
.test-__________2 {

}`,
      ['{{var}}', '{{autrevar}}']
    )
  ).toBe(`.test-{{var}} {
  
}
.test-{{autrevar}} {

}`);
});
it('should prefix variables', () => {
  expect(
    prefixCSS(
      `.test-{{var}} {
  color: red;
}`,
      {
        block: '.prefix',
        parent: '.parent',
      }
    )
  ).toBe(`.prefix .test-{{var}} {
  color: red;
}`);

  expect(
    prefixCSS(
      `.category-button--{{filters.category|replace:'[^a-zA-Z0-9]','-', 'g'}} .pr-block-action__button {
  color: var(--primary) ! important;
}`,
      {
        block: '.prefix',
        parent: '.parent',
      }
    )
  )
    .toBe(`.prefix .category-button--{{filters.category|replace:'[^a-zA-Z0-9]','-', 'g'}} .pr-block-action__button {
  color: var(--primary) ! important;
}`);
});
