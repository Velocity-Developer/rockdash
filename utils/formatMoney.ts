// utils/formatMoney.ts
export function formatMoney(value: number, currency: string = 'Rp') {
  // const v = new Intl.NumberFormat().format(value);

  //jika value = kosong maka return 0
  if(value === null || value === undefined || value === 0){
    return '-';
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

  //jika currency = reseller maka currency = USD
  if(currency === 'resellercamp'){
    currency = '$' 
  } else if(currency ==='false') {
    currency = '' 
  } else {
    currency = 'Rp' 
  }

  return currency +' '+ formatted;
}