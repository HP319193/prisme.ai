import { FieldProps, Input } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useField } from 'react-final-form';
import { Cron, Locale } from 'react-js-cron';
import 'react-js-cron/dist/styles.css';

export const Schedule = ({ name }: FieldProps) => {
  const field = useField(name);
  const { t } = useTranslation('schedules');
  const locales: Locale = useMemo(
    () => ({
      everyText: t('everyText'),
      emptyMonths: t('emptyMonths'),
      emptyMonthDays: t('emptyMonthDays'),
      emptyMonthDaysShort: t('emptyMonthDaysShort'),
      emptyWeekDays: t('emptyWeekDays'),
      emptyWeekDaysShort: t('emptyWeekDaysShort'),
      emptyHours: t('emptyHours'),
      emptyMinutes: t('emptyMinutes'),
      emptyMinutesForHourPeriod: t('emptyMinutesForHourPeriod'),
      yearOption: t('yearOption'),
      monthOption: t('monthOption'),
      weekOption: t('weekOption'),
      dayOption: t('dayOption'),
      hourOption: t('hourOption'),
      minuteOption: t('minuteOption'),
      rebootOption: t('rebootOption'),
      prefixPeriod: t('prefixPeriod'),
      prefixMonths: t('prefixMonths'),
      prefixMonthDays: t('prefixMonthDays'),
      prefixWeekDays: t('prefixWeekDays'),
      prefixWeekDaysForMonthAndYearPeriod: t(
        'prefixWeekDaysForMonthAndYearPeriod'
      ),
      prefixHours: t('prefixHours'),
      prefixMinutes: t('prefixMinutes'),
      prefixMinutesForHourPeriod: t('prefixMinutesForHourPeriod'),
      suffixMinutesForHourPeriod: t('suffixMinutesForHourPeriod'),
      errorInvalidCron: t('errorInvalidCron'),
      clearButtonText: t('clearButtonText'),
      weekDays: Array.from(new Array(7), (v, k) => k).map((k) =>
        t(`weekDays.${k}`)
      ),
      months: Array.from(new Array(12), (v, k) => k).map((k) =>
        t(`months.${k}`)
      ),
      altWeekDays: Array.from(new Array(7), (v, k) => k).map((k) =>
        t(`altWeekDays.${k}`)
      ),
      altMonths: Array.from(new Array(12), (v, k) => k).map((k) =>
        t(`altMonths.${k}`)
      ),
    }),
    [t]
  );

  return (
    <div className="m-4">
      <Input {...field.input} />
      <Cron
        value={field.input.value}
        setValue={field.input.onChange}
        locale={locales}
        className="flex items-center my-4"
        clearButton={false}
      />
    </div>
  );
};

export default Schedule;
