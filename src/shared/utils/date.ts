import { format, isValid, parseISO } from 'date-fns';

const DATE_TIME_FORMAT = 'yyyy/MM/dd HH:mm';

export const formatDateTime = (value: string) => {
  const date = parseISO(value);
  if (!isValid(date)) {
    return value;
  }
  return format(date, DATE_TIME_FORMAT);
};
