import type { Args, Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit-html';

import { PAGINATION_SIZE } from '../bq-pagination.types';
import mdx from './bq-pagination.mdx';

const meta: Meta = {
  title: 'Components/Pagination',
  component: 'bq-pagination',
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    arrows: { control: 'boolean' },
    page: { control: 'number' },
    pages: { control: 'number' },
    'sibling-count': { control: 'number' },
    'boundary-count': { control: 'number' },
    size: { control: 'select', options: [...PAGINATION_SIZE] },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    bqChange: { action: 'bqChange' },
  },
  args: {
    arrows: true,
    page: 1,
    pages: 10,
    'sibling-count': 1,
    'boundary-count': 1,
    size: 'medium',
    disabled: false,
    label: 'Pagination',
  },
};
export default meta;

type Story = StoryObj;

const Template = (args: Args) => html`
  <bq-pagination
    .arrows=${args.arrows}
    page=${args.page}
    pages=${args.pages}
    sibling-count=${args['sibling-count']}
    boundary-count=${args['boundary-count']}
    size=${args.size}
    ?disabled=${args.disabled}
    label=${args.label}
    @bqChange=${args.bqChange}
  ></bq-pagination>
`;

export const Default: Story = {
  render: Template,
  args: {
    page: 5,
  },
};

export const Small: Story = {
  render: Template,
  args: {
    page: 5,
    size: 'small',
  },
};

export const FewPages: Story = {
  render: Template,
  args: {
    page: 2,
    pages: 4,
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    page: 5,
    disabled: true,
  },
};

export const WithoutArrows: Story = {
  render: Template,
  args: {
    arrows: false,
    page: 5,
  },
};
