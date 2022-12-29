export const defaultStyles = `
body {
  --color-accent: #015dff;
  --color-accent-light: #80A4FF;
  --color-background: white;
  --color-text: black;
  --color-border: black;
  --color-background-transparent: rgba(0,0,0,0.05);
  --color-input-background: white;
  background-color: var(--color-background);
}

.content-stack__content {
  background-color: var(--color-background);
  margin-top: 1rem;
}

.content-stack__content .block-form {
  padding-left: 2rem !important;
}
.content-stack__content .block-cards,
.content-stack__content .block-rich-text {
  padding-left: 2rem;
}

.page-blocks {
  padding: 2rem;
}

.block-form {
  padding: 0;
}

.block-form label {
  color: var(--color-text)
}

.block-form .ant-input {
  width: calc(100% - 2rem);
  border-radius: 0.625rem;
  border-color: var(--color-border);
  color: var(--color-text);
  background-color: var(--color-input-background);
}

.block-form .ant-input::placeholder {
  color: black;
}`;
