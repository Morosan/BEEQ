import type { Args, Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit-html';

import mdx from './bq-tree-item.mdx';

const meta: Meta = {
  title: 'Components/Tree/Tree item',
  component: 'bq-tree-item',
  parameters: { docs: { page: mdx } },
  argTypes: {
    disabled: { control: 'boolean' },
    expanded: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    lazy: { control: 'boolean' },
    selected: { control: 'boolean' },
    tabIndex: { control: 'number' },
    bqAfterCollapse: { action: 'bqAfterCollapse', table: { disable: true } },
    bqAfterExpand: { action: 'bqAfterExpand', table: { disable: true } },
    bqCollapse: { action: 'bqCollapse', table: { disable: true } },
    bqExpand: { action: 'bqExpand', table: { disable: true } },
    bqLazyLoad: { action: 'bqLazyLoad', table: { disable: true } },
    label: { control: 'text', table: { disable: true } },
  },
  args: {
    disabled: false,
    expanded: true,
    indeterminate: false,
    label: 'Documents',
    lazy: false,
    selected: false,
    tabIndex: -1,
  },
};
export default meta;

type Story = StoryObj;

const Template = (args: Args) => html`
  <bq-tree>
    <bq-tree-item
      ?disabled=${args.disabled}
      ?expanded=${args.expanded}
      ?indeterminate=${args.indeterminate}
      ?lazy=${args.lazy}
      ?selected=${args.selected}
      .tabIndex=${args.tabIndex}
      @bqAfterCollapse=${args.bqAfterCollapse}
      @bqAfterExpand=${args.bqAfterExpand}
      @bqCollapse=${args.bqCollapse}
      @bqExpand=${args.bqExpand}
      @bqLazyLoad=${args.bqLazyLoad}
    >
      <bq-icon name="folder" slot="prefix"></bq-icon>
      ${args.label}
      <bq-tree-item>Child item</bq-tree-item>
    </bq-tree-item>
  </bq-tree>
`;

export const Default: Story = { render: Template };
export const Disabled: Story = { render: Template, args: { disabled: true } };
export const Selected: Story = { render: Template, args: { selected: true } };

export const CustomExpandIcons: Story = {
  render: () => html`
    <bq-tree>
      <bq-tree-item expanded>
        Parent
        <bq-icon name="plus-square" slot="expand-icon"></bq-icon>
        <bq-icon name="minus-square" slot="collapse-icon"></bq-icon>
        <bq-tree-item>Child item</bq-tree-item>
      </bq-tree-item>
    </bq-tree>
  `,
};
