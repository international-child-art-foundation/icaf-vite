export type SortValue = 'Newest Event' | 'Oldest Event';

export const sortBy: Array<{ name: SortValue; number: number }> = [
  { name: 'Newest Event', number: 0 },
  { name: 'Oldest Event', number: 0 },
];
