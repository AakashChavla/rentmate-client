import { useLocale } from 'next-intl';
import { FORMAT } from '../../config/app.constants';
export function DateText({
  value,
  timeZone = FORMAT.TIMEZONE,
}: {
  value: string | Date;
  timeZone?: string;
}): React.JSX.Element {
  const locale = useLocale();
  const date = new Date(value);
  return (
    <time dateTime={date.toISOString()}>
      {new Intl.DateTimeFormat(FORMAT.LOCALE[locale], { dateStyle: 'medium', timeZone }).format(
        date,
      )}
    </time>
  );
}
