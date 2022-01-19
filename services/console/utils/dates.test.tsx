import { format, FormatReturn, useDateFormat } from "./dates";
import en from "date-fns/locale/en-US";
import renderer, { act } from "react-test-renderer";

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      locale: "fr",
    },
  }),
}));

let now = Date.now;
afterEach(() => {
  Date.now = now;
});

const enWithoutHourOption = {
  ...en,
  formatRelativeLocaleWithoutHour: {
    lastWeek: "'Last' eeee",
    yesterday: "'Yesterday'",
    today: "'Today'",
    tomorrow: "'Tomorrow'",
    nextWeek: "'Next' eeee",
    other: "dd.MM.yyyy",
  },
};
it("should return date to string", () => {
  const formatter = format(enWithoutHourOption);
  expect(formatter(new Date(2022, 0, 1))).toBe(new Date(2022, 0, 1).toString());
});

it("should return date as string to string", () => {
  const formatter = format(enWithoutHourOption);
  expect(formatter("2022-01-01")).toBe(new Date("2022-01-01").toString());
});

it("should format date", () => {
  const formatter = format(enWithoutHourOption);
  expect(formatter(new Date(2022, 0, 1), { format: "yyyy" })).toBe("2022");
});

it("should format date to relative", () => {
  const formatter = format(enWithoutHourOption);
  expect(
    formatter(new Date(2022, 0, 1), { relative: new Date(2022, 0, 3) })
  ).toBe("last Saturday at 12:00 AM");
});

it("should format date to relative from current date", () => {
  Date.now = () => +new Date(2022, 0, 3);
  const formatter = format(enWithoutHourOption);
  expect(formatter(new Date(2022, 0, 1), { relative: true })).toBe(
    "last Saturday at 12:00 AM"
  );
});

it("should format date to relative from date as string", () => {
  Date.now = () => +new Date(2022, 0, 3);
  const formatter = format(enWithoutHourOption);
  expect(formatter(new Date(2022, 0, 1), { relative: "2022-01-03" })).toBe(
    "last Saturday at 12:00 AM"
  );
});

it("should format date to relative from date as string without hour", () => {
  Date.now = () => +new Date(2022, 0, 3);
  const formatter = format(enWithoutHourOption);
  expect(
    formatter(new Date(2022, 0, 1), {
      relative: "2022-01-03",
      withoutHour: true,
    })
  ).toBe("Last Saturday");
});

it("should use date format", async () => {
  let dateFormat: FormatReturn = () => "fail";
  const Test = () => {
    dateFormat = useDateFormat();
    return null;
  };
  const root = renderer.create(<Test />);

  const date = new Date(2022, 0, 1);
  expect(dateFormat(date, { format: "yyyy" })).toBe("");

  await act(async () => {
    await true;
  });

  expect(dateFormat(date, { format: "yyyy" })).toBe("2022");
});
