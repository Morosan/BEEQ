export const TREE_SELECTION = ['single', 'multiple', 'leaf', 'leaf-multiple'] as const;
export type TTreeSelection = (typeof TREE_SELECTION)[number];

export const TREE_SIZE = ['small', 'medium', 'large'] as const;
export type TTreeSize = (typeof TREE_SIZE)[number];

export type TTreeSelectionChangeEventDetail = {
  item: HTMLBqTreeItemElement;
  selectedItems: HTMLBqTreeItemElement[];
};
