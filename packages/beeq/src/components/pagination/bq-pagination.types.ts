export const PAGINATION_SIZE = ['small', 'medium'] as const;
export type TPaginationSize = (typeof PAGINATION_SIZE)[number];

export type TPaginationChange = {
  page: number;
};

export type TPaginationItem = number | 'ellipsis';
