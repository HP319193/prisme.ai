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
  background-color: var(--color-background);
}

.page-blocks > .pr-block-blocks-list {
  display: flex;
  flex-direction: column;
  min-width: 100%;
  min-height: 100%;
  flex: 1;
}

.pr-poweredby {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
}
`;
