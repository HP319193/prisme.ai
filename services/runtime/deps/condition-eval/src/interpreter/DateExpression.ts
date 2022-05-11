import Evaluatable from '../Evaluatable';
import Variable from './Variable';

class DateExpression extends Evaluatable {
  date;
  field;

  constructor([date, field]: any) {
    super();

    this.date = date;
    this.field = field;
  }

  evaluate(context: any) {
    try {
      const date = new Date(
        this.date instanceof Variable ? this.date.evaluate(context) : this.date
      );
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
        case undefined:
          return date.getTime();
        default:
          throw new Error(`Unsupported date(...) field ${this.field}`);
      }
    } catch {
      return undefined;
    }
  }
}

export default DateExpression;
