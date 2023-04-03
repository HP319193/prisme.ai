import { DEFAULT_LOCALE, DEFAULT_TIMEZONE } from '../../../../config';
import { InvalidExpressionSyntax } from '../../../../src/errors';
import Evaluatable from '../Evaluatable';
import Variable from './Variable';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);
const loadedLocales = new Set();

class DateExpression extends Evaluatable {
  date;
  field;
  format;
  locale;
  timezone;

  constructor({ functionArgs, resultKey }: any) {
    super();

    const [date, format, locale, timezone] = functionArgs;
    this.date = date;
    this.field = resultKey;
    this.format = format;
    this.locale = locale || DEFAULT_LOCALE;
    this.timezone = timezone || DEFAULT_TIMEZONE;
  }

  evaluate(context: any) {
    try {
      const date = new Date(
        this.date instanceof Variable ? this.date.evaluate(context) : this.date
      );

      if (this.format) {
        if (!loadedLocales.has(this.locale)) {
          require(`dayjs/locale/${this.locale}`);
          loadedLocales.add(this.locale);
        }
        const formatted = dayjs(date)
          .tz(this.timezone)
          .locale(this.locale)
          .format(this.format);
        return formatted;
      }

      switch (this.field) {
        case 'day':
          return date.getUTCDay();
        case 'month':
          return date.getUTCMonth() + 1;
        case 'year':
          return date.getUTCFullYear();
        case 'hour':
          return date.getUTCHours();
        case 'minute':
          return date.getUTCMinutes();
        case 'second':
          return date.getUTCSeconds();
        case 'date':
          return date.getUTCDate();
        case 'iso':
          return date.toISOString();
        case 'ts':
        case null:
        case undefined:
          return date.getTime();
        default:
          throw new InvalidExpressionSyntax(
            `Unsupported date(...) field ${this.field}`
          );
      }
    } catch {
      return undefined;
    }
  }
}

export default DateExpression;
