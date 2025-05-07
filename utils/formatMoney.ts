// utils/formatMoney.ts
export function formatMoney(value: number, currency: string = 'Rp') {
  // const v = new Intl.NumberFormat().format(value);

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

  //jika currency = reseller maka currency = USD
  if(currency === 'resellercamp'){
    currency = 'USD' 
  } else {
    currency = 'Rp' 
  }

  return currency +' '+ formatted;
}