import { useLocale } from 'next-intl';
import { FORMAT } from '../../config/app.constants';
export function CurrencyText({ value }: { value: number }): React.JSX.Element {
  const locale = useLocale();
  return (
    <span>
      {new Intl.NumberFormat(FORMAT.LOCALE[locale], {
        style: 'currency',
        currency: FORMAT.CURRENCY,
        maximumFractionDigits: FRACTION_DIGITS,
      }).format(value)}
    </span>
  );
}
const FRACTION_DIGITS = 2;
