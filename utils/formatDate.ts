// utils/formatDate.ts
import dayjs from 'dayjs'
import 'dayjs/locale/id'
dayjs.locale('id')

export function formatDate(value: string,format: string = 'DD MMMM YYYY') {

    return dayjs(value).format(format)
}
