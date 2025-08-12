// utils/formatTanggal.ts
export function formatTanggal(value: string) {

    //jika value = '0000-00-00'
    if (value === '0000-00-00') {
      return '-'; 
    }

    //ubah format tanggal dari 2021-01-01 menjadi 01 Januari 2021
    const tanggal = value.split('-') as any;
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return tanggal[2] + ' ' + bulan[parseInt(tanggal[1]) - 1] + ' ' + tanggal[0];
  }