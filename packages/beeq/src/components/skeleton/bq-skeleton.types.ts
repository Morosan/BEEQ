export const SKELETON_EFFECT = ['none', 'pulse', 'sheen'] as const;
export type TSkeletonEffect = (typeof SKELETON_EFFECT)[number];

export const SKELETON_SHAPE = ['rectangle', 'circle', 'text'] as const;
export type TSkeletonShape = (typeof SKELETON_SHAPE)[number];
