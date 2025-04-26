// utils/formatMoney.ts
export function formatMoney(value: number) {
  return new Intl.NumberFormat().format(value);
}