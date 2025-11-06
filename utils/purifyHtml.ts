export function purifyHtml(html: string,length: number = 0) {

    //hitung total karakter
    let total = html.length

    //replace &nbsp; with space
    html = html.replace(/&nbsp;/g, ' ')

    //replace tag html 
    html = html.replace(/<[^>]*>/g, '')

    //jika length > 0, maka cut string dan total karakter lebih dari length
    if(length > 0 && total > length) {
        html = html.substring(0, length)
        //tambahkan ... diakhir
        html += '...'
    }

    return html;
}