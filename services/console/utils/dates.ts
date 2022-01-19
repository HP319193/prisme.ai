import formatDate from "date-fns/format";
import formatRelative from "date-fns/formatRelative";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

interface LocaleWithoutHourOption extends Locale {
  formatRelativeLocaleWithoutHour: {
    lastWeek: string;
    yesterday: string;
    today: string;
    tomorrow: string;
    nextWeek: string;
    other: string;
  };
}
interface FormatOptions {
  relative?: boolean | Date | string;
  withoutHour?: boolean;
  format?: string;
}
export type FormatReturn = (
  date: Date | string,
  options?: FormatOptions
) => string;
export const format =
  (locale: LocaleWithoutHourOption): FormatReturn =>
  (date, { relative, format, withoutHour } = {}) => {
    const d = date instanceof Date ? date : new Date(date);

    if (relative) {
      const baseDate =
        relative === true
          ? new Date(Date.now())
          : relative instanceof Date
          ? relative
          : new Date(relative);

      return formatRelative(d, baseDate, {
        locale:
          withoutHour && locale.formatRelativeLocaleWithoutHour
            ? {
                ...locale,
                formatRelative: (
                  token: keyof typeof locale.formatRelativeLocaleWithoutHour
                ) => locale.formatRelativeLocaleWithoutHour[token],
              }
            : locale,
        weekStartsOn: 1,
      });
    }
    if (format) {
      return formatDate(d, format, { locale });
    }
    return d.toString();
  };

const getLocale = async (lang: string) => {
  let formatRelativeLocaleWithoutHour = {
    lastWeek: "'Last' eeee",
    yesterday: "'Yesterday'",
    today: "'Today'",
    tomorrow: "'Tomorrow'",
    nextWeek: "'Next' eeee",
    other: "dd.MM.yyyy",
  };
  let locale: LocaleWithoutHourOption;

  switch (lang) {
    case "fr": {
      const module = await import("date-fns/locale/fr");
      locale = {
        ...module.default,
        formatRelativeLocaleWithoutHour: {
          lastWeek: "eeee 'dernier'",
          yesterday: "'hier'",
          today: "'aujourd’hui'",
          tomorrow: "'demain'",
          nextWeek: "eeee 'prochain'",
          other: "P",
        },
      };
      break;
    }
    case "es": {
      const module = await import("date-fns/locale/es");
      locale = {
        ...module.default,
        formatRelativeLocaleWithoutHour: {
          lastWeek: "'el' eeee 'pasado'",
          yesterday: "'ayer'",
          today: "'hoy'",
          tomorrow: "'mañana'",
          nextWeek: "eeee",
          other: "P",
        },
      };
      break;
    }
    default: {
      const module = await import("date-fns/locale/en-US");
      locale = {
        ...module.default,
        formatRelativeLocaleWithoutHour,
      };
    }
  }
  return locale;
};

export const useDateFormat = () => {
  const { i18n: { language = "en" } = {} } = useTranslation();
  const [formatFn, setFormatFn] = useState<FormatReturn>(
    () => (date: Date | string) => ""
  );

  useEffect(() => {
    const fetchLocale = async () => {
      const l = await getLocale(language);
      setFormatFn(() => format(l));
    };
    fetchLocale();
  }, [language]);

  return formatFn;
};
