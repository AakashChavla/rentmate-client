type CurrencyTextProps = {
  amount: number;
  currency?: string;
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function CurrencyText({ amount, currency = "INR" }: CurrencyTextProps) {
  const formatted =
    currency === "INR"
      ? inrFormatter.format(amount)
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }).format(amount);

  return <span>{formatted}</span>;
}
