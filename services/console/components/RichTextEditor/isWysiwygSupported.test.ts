import { isWysiwygSupported } from './isWysiwygSupported';

it('should be wysisyg supported 1', () => {
  expect(isWysiwygSupported(`<p>Hello <strong>World</strong></p>`)).toBe(true);
});

it('should not be wysisyg supported mode 2', () => {
  expect(isWysiwygSupported(`<div>Oups</div>`)).toBe(false);
});

it('should not be wysisyg supported 3', () => {
  expect(isWysiwygSupported(`<div><p>Oups</p></div>`)).toBe(false);
});

it('should be wysisyg supported 4', () => {
  expect(isWysiwygSupported(`<p>1</p><p>2</p>`)).toBe(true);
});

it('should be wysisyg supported 5', () => {
  expect(isWysiwygSupported(`<img src="foo"/>`)).toBe(true);
});

it('should not be wysisyg supported 6', () => {
  expect(isWysiwygSupported(`<img src="foo" alt="foo"/>`)).toBe(false);
});

it('should be wysisyg supported 7', () => {
  expect(isWysiwygSupported(`<iframe class="ql-video"/>`)).toBe(true);
});

it('should not be wysisyg supported 7', () => {
  expect(isWysiwygSupported(`<iframe class="ql-video foo"/>`)).toBe(false);
});
