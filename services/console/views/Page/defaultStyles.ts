export const defaultStyles = `
body {
  --color-accent: #015dff;
  --color-accent-light: #80A4FF;
  --color-accent-dark: #052e84;
  --color-accent-darker: #03133a;
  --color-accent-contrast: white;
  --color-background: white;
  --color-text: black;
  --color-border: black;
  --color-background-transparent: rgba(0,0,0,0.05);
  --color-input-background: white;
  --pr-page-x-margin: 60px;
  --pr-form-padding: 0;
  background-color: var(--color-background);
}

@media (max-width: 767px) {
  body {
    --pr-page-x-margin: 20px;
  }
}

.page-blocks > .pr-block-blocks-list {
  display: flex;
  flex-direction: column;
  min-width: 100%;
  min-height: 100%;
  flex: 1;
  padding: 0 var(--pr-page-x-margin) 0 var(--pr-page-x-margin);
}

.page-blocks > .pr-block-blocks-list > .block-cards {
  width: 100vw;
  margin: 0 calc(-1 * var(--pr-page-x-margin));
}

.page-blocks > .pr-block-blocks-list > .block-cards .cards-container__cards-container > div:first-child {
  padding-left: var(--pr-page-x-margin);
}

.pr-poweredby {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
}
`;
