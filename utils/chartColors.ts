// utils/chartColors.ts

export const pastelColors = [
  '#6ec6ca',
  '#ff9f8a',
  '#8fc9ff',
  '#b892d9',
  '#ff9fc2',
  '#7fd8a8',
  '#ffd27a',
  '#c7d36f',
  '#67d9c2',
  '#f58ea8',

  '#9ea8ff',
  '#f7b2d0',
  '#78d6c6',
  '#ffe08a',
  '#79b8ff',
  '#f8a8b8',
  '#9fd3a8',
  '#ffbe66',
  '#b7db6b',
  '#c792ff',
]

export const pastelBorderColors = [
  '#4db4b8',
  '#f7846b',
  '#66b5f7',
  '#9d73c9',
  '#f77fb0',
  '#5fc58f',
  '#f7bf52',
  '#aebd52',
  '#46c8ae',
  '#eb7294',

  '#7f8cff',
  '#ef94be',
  '#58c8b6',
  '#f7cf5e',
  '#5ea5f2',
  '#ef8ea1',
  '#7bbf8a',
  '#f7aa42',
  '#9ec552',
  '#b473f2',
]

export function generatePastelColors(total: number): string[] {
  return Array.from(
    { length: total },
    (_, i) => pastelColors[i % pastelColors.length]!
  )
}

export function generatePastelBorders(total: number): string[] {
  return Array.from(
    { length: total },
    (_, i) => pastelBorderColors[i % pastelBorderColors.length]!
  )
}