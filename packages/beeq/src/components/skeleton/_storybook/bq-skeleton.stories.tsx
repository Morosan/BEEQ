import type { Args, Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit-html';

import { isChromatic, skipSnapshotParameters } from '../../../../.storybook/chromatic-parameters';
import { SKELETON_EFFECT, SKELETON_SHAPE } from '../bq-skeleton.types';
import mdx from './bq-skeleton.mdx';

const meta: Meta = {
  title: 'Components/Skeleton',
  component: 'bq-skeleton',
  parameters: {
    docs: {
      page: mdx,
    },
    chromatic: {
      disableSnapshot: isChromatic(),
    },
  },
  argTypes: {
    effect: { control: 'select', options: [...SKELETON_EFFECT] },
    height: { control: 'text' },
    shape: { control: 'select', options: [...SKELETON_SHAPE] },
    width: { control: 'text' },
  },
  args: {
    effect: 'none',
    height: '1rem',
    shape: 'rectangle',
    width: '100%',
  },
};
export default meta;

type Story = StoryObj;

const Template = (args: Args) => html`
  <bq-skeleton effect=${args.effect} height=${args.height} shape=${args.shape} width=${args.width}></bq-skeleton>
`;

export const Default: Story = {
  render: Template,
  parameters: skipSnapshotParameters,
};

export const Sheen: Story = {
  render: Template,
  args: {
    effect: 'sheen',
  },
  parameters: skipSnapshotParameters,
};

export const Pulse: Story = {
  render: Template,
  args: {
    effect: 'pulse',
  },
  parameters: skipSnapshotParameters,
};

export const Text: Story = {
  render: () => html`
    <div style="display: grid; gap: 0.75rem; max-width: 32rem;">
      <bq-skeleton shape="text" width="95%"></bq-skeleton>
      <bq-skeleton shape="text" width="88%"></bq-skeleton>
      <bq-skeleton shape="text" width="62%"></bq-skeleton>
    </div>
  `,
  parameters: skipSnapshotParameters,
};

export const Avatar: Story = {
  render: () => html`<bq-skeleton effect="sheen" shape="circle" height="3rem" width="3rem"></bq-skeleton>`,
  parameters: skipSnapshotParameters,
};

export const Card: Story = {
  render: () => html`
    <div style="display: grid; gap: 1rem; max-width: 20rem;">
      <bq-skeleton effect="sheen" height="10rem"></bq-skeleton>
      <div style="display: grid; gap: 0.75rem;">
        <bq-skeleton effect="sheen" shape="text" width="80%"></bq-skeleton>
        <bq-skeleton effect="sheen" shape="text" width="55%"></bq-skeleton>
      </div>
    </div>
  `,
  parameters: skipSnapshotParameters,
};
