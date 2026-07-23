import { h } from '@stencil/core';
import { afterEach, describe, expect, it, render, vi, waitForStable } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

afterEach(() => {
  vi.restoreAllMocks();
});

const getExpandButton = (item: HTMLBqTreeItemElement) =>
  item.shadowRoot?.querySelector<HTMLElement>('[part="expand-button"]');

describe('bq-tree-item', () => {
  it('should render with a shadow root', async () => {
    const { root } = await render(<bq-tree-item />);

    expect(root).not.toBeNull();
    expect(root).toHaveShadowRoot();
  });

  it('reflects its public state props', async () => {
    const { root } = await render(<bq-tree-item disabled expanded indeterminate lazy selected tabindex={0} />);

    expect(root).toEqualAttribute('disabled', '');
    expect(root).toEqualAttribute('expanded', '');
    expect(root).toEqualAttribute('indeterminate', '');
    expect(root).toEqualAttribute('lazy', '');
    expect(root).toEqualAttribute('selected', '');
    expect(root).toEqualAttribute('tabindex', '0');
  });

  it('renders with treeitem semantics', async () => {
    const { root } = await render(
      <bq-tree>
        <bq-tree-item>Item</bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    await waitForStable(item);

    expect(item).toEqualAttribute('role', 'treeitem');
    expect(item).toEqualAttribute('aria-selected', 'false');
    expect(item).not.toHaveAttribute('aria-expanded');
  });

  it('expands and collapses a parent item', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <bq-tree>
        <bq-tree-item>
          Parent
          <bq-tree-item>Child</bq-tree-item>
        </bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    await waitForStable(item);
    const expand = spyOnEvent('bqExpand');
    const afterExpand = spyOnEvent('bqAfterExpand');
    const collapse = spyOnEvent('bqCollapse');
    const afterCollapse = spyOnEvent('bqAfterCollapse');

    await userEvent.click(getExpandButton(item));
    await waitForChanges();
    expect(item.expanded).toBe(true);
    expect(expand).toHaveReceivedEventTimes(1);
    expect(afterExpand).toHaveReceivedEventTimes(1);

    await userEvent.click(getExpandButton(item));
    await waitForChanges();
    expect(item.expanded).toBe(false);
    expect(collapse).toHaveReceivedEventTimes(1);
    expect(afterCollapse).toHaveReceivedEventTimes(1);
  });

  it('supports canceling expansion', async () => {
    const { root, waitForChanges } = await render(
      <bq-tree>
        <bq-tree-item>
          Parent
          <bq-tree-item>Child</bq-tree-item>
        </bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    await waitForStable(item);
    item.addEventListener('bqExpand', (event) => event.preventDefault());

    await userEvent.click(getExpandButton(item));
    await waitForChanges();

    expect(item.expanded).toBe(false);
  });

  it('emits a lazy-load request once while loading', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <bq-tree>
        <bq-tree-item lazy>Remote repositories</bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    await waitForStable(item);
    const lazyLoad = spyOnEvent('bqLazyLoad');

    await userEvent.click(getExpandButton(item));
    await userEvent.click(getExpandButton(item));
    await waitForChanges();

    expect(lazyLoad).toHaveReceivedEventTimes(1);
    expect(item.shadowRoot?.querySelector('bq-spinner')).not.toBeNull();
  });

  it('returns direct children and can exclude disabled children', async () => {
    const { root } = await render(
      <bq-tree>
        <bq-tree-item>
          Parent
          <bq-tree-item>Enabled</bq-tree-item>
          <bq-tree-item disabled>Disabled</bq-tree-item>
        </bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    await waitForStable(item);

    expect(await item.getChildrenItems()).toHaveLength(2);
    expect(await item.getChildrenItems({ includeDisabled: false })).toHaveLength(1);
  });

  it('moves focus with vFocus', async () => {
    const { root } = await render(
      <bq-tree>
        <bq-tree-item>Focusable</bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    await waitForStable(item);

    await item.vFocus();

    expect(document.activeElement).toBe(item);
  });

  it('renders named prefix and suffix slots', async () => {
    const { root } = await render(
      <bq-tree-item>
        Label
        <bq-icon name="folder" slot="prefix" />
        <span slot="suffix">Metadata</span>
      </bq-tree-item>,
    );

    const prefix = root.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="prefix"]');
    const suffix = root.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="suffix"]');
    expect(prefix.assignedElements()).toHaveLength(1);
    expect(suffix.assignedElements()).toHaveLength(1);
  });

  it('renders custom expand and collapse icon slots', async () => {
    const { root, waitForChanges } = await render(
      <bq-tree-item>
        Parent
        <bq-icon name="plus-square" slot="expand-icon" />
        <bq-icon name="minus-square" slot="collapse-icon" />
        <bq-tree-item>Child</bq-tree-item>
      </bq-tree-item>,
    );

    expect(
      root.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="expand-icon"]')?.assignedElements(),
    ).toHaveLength(1);

    root.expanded = true;
    await waitForChanges();

    expect(
      root.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="collapse-icon"]')?.assignedElements(),
    ).toHaveLength(1);
  });
});
