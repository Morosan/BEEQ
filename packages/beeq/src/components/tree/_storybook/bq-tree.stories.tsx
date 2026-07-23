import type { Args, Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit-html';

import { TREE_SELECTION, TREE_SIZE } from '../bq-tree.types';
import mdx from './bq-tree.mdx';

const meta: Meta = {
  title: 'Components/Tree',
  component: 'bq-tree',
  parameters: { docs: { page: mdx } },
  argTypes: {
    indentGuides: { control: 'boolean', table: { disable: true } },
    selection: { control: 'select', options: [...TREE_SELECTION] },
    size: { control: 'select', options: [...TREE_SIZE] },
    bqSelectionChange: { action: 'bqSelectionChange', table: { disable: true } },
  },
  args: { selection: 'single', size: 'medium' },
};
export default meta;

type Story = StoryObj;

const Template = (args: Args) => html`
  <bq-tree
    selection=${args.selection}
    size=${args.size}
    @bqSelectionChange=${args.bqSelectionChange}
    style="--bq-tree--indent-guide-width: ${args.indentGuides ? '1px' : '0px'}"
  >
    <bq-tree-item expanded>
      <bq-icon name="folder" slot="prefix"></bq-icon>
      Documents
      <bq-tree-item>
        <bq-icon name="file" slot="prefix"></bq-icon>
        Project brief.pdf
      </bq-tree-item>
      <bq-tree-item expanded>
        <bq-icon name="folder" slot="prefix"></bq-icon>
        Reports
        <bq-tree-item><bq-icon name="file" slot="prefix"></bq-icon>January.pdf</bq-tree-item>
        <bq-tree-item><bq-icon name="file" slot="prefix"></bq-icon>February.pdf</bq-tree-item>
      </bq-tree-item>
    </bq-tree-item>
    <bq-tree-item disabled><bq-icon name="folder" slot="prefix"></bq-icon>Archive</bq-tree-item>
    <bq-tree-item><bq-icon name="folder" slot="prefix"></bq-icon>Downloads</bq-tree-item>
  </bq-tree>
`;

export const Default: Story = { render: Template, args: { indentGuides: false } };

export const Multiple: Story = {
  render: Template,
  args: { indentGuides: true, selection: 'multiple' },
};

export const LeafSelection: Story = {
  render: Template,
  args: { indentGuides: true, selection: 'leaf-multiple' },
};

export const LazyLoading: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args: Args) => html`
    <bq-tree
      selection=${args.selection}
      size=${args.size}
      @bqLazyLoad=${(event: CustomEvent<HTMLBqTreeItemElement>) => {
        window.setTimeout(() => {
          event.detail.insertAdjacentHTML(
            'beforeend',
            '<bq-tree-item>design-system</bq-tree-item><bq-tree-item>marketing-site</bq-tree-item>',
          );
          event.detail.lazy = false;
        }, 800);
      }}
    >
      <bq-tree-item lazy>Remote repositories</bq-tree-item>
    </bq-tree>
  `,
};
