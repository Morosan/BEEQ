import { h } from '@stencil/core';
import { afterEach, describe, expect, it, render, vi, waitForStable } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

afterEach(() => {
  vi.restoreAllMocks();
});

const getRow = (item: HTMLBqTreeItemElement) => item.shadowRoot?.querySelector<HTMLElement>('[part="item"]');

describe('bq-tree', () => {
  it('should render with a shadow root', async () => {
    const { root } = await render(<bq-tree />);

    expect(root).not.toBeNull();
    expect(root).toHaveShadowRoot();
  });

  it('reflects the selection and size props', async () => {
    const { root } = await render(<bq-tree selection="leaf-multiple" size="large" />);

    expect(root).toEqualAttribute('selection', 'leaf-multiple');
    expect(root).toEqualAttribute('size', 'large');
    expect(root).toEqualAttribute('aria-multiselectable', 'true');
  });

  it('renders an accessible tree with roving tabindex', async () => {
    const { root } = await render(
      <bq-tree>
        <bq-tree-item>First</bq-tree-item>
        <bq-tree-item>Second</bq-tree-item>
      </bq-tree>,
    );
    await waitForStable(root);

    const items = Array.from(root.querySelectorAll<HTMLBqTreeItemElement>('bq-tree-item'));

    expect(root).toEqualAttribute('role', 'tree');
    expect(items[0]).toEqualAttribute('tabindex', '0');
    expect(items[1]).toEqualAttribute('tabindex', '-1');
  });

  it('keeps one item selected in single mode', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <bq-tree selection="single">
        <bq-tree-item selected>First</bq-tree-item>
        <bq-tree-item>Second</bq-tree-item>
      </bq-tree>,
    );
    const items = Array.from(root.querySelectorAll<HTMLBqTreeItemElement>('bq-tree-item'));
    const selectionChange = spyOnEvent('bqSelectionChange');

    await userEvent.click(getRow(items[1]));
    await waitForChanges();

    expect(items[0].selected).toBe(false);
    expect(items[1].selected).toBe(true);
    expect(selectionChange).toHaveReceivedEventTimes(1);
  });

  it('selects descendants and updates ancestors in multiple mode', async () => {
    const { root, waitForChanges } = await render(
      <bq-tree selection="multiple">
        <bq-tree-item expanded>
          Parent
          <bq-tree-item>Child one</bq-tree-item>
          <bq-tree-item>Child two</bq-tree-item>
        </bq-tree-item>
      </bq-tree>,
    );
    await waitForStable(root);
    const items = Array.from(root.querySelectorAll<HTMLBqTreeItemElement>('bq-tree-item'));

    await userEvent.click(getRow(items[0]));
    await waitForChanges();

    expect(items.every((item) => item.selected)).toBe(true);

    await userEvent.click(getRow(items[1]));
    await waitForChanges();

    expect(items[0].selected).toBe(false);
    expect(items[0].indeterminate).toBe(true);
  });

  it('only selects leaves in leaf mode', async () => {
    const { root, waitForChanges } = await render(
      <bq-tree selection="leaf">
        <bq-tree-item>
          Parent
          <bq-tree-item>Child</bq-tree-item>
        </bq-tree-item>
      </bq-tree>,
    );
    await waitForStable(root);
    const items = Array.from(root.querySelectorAll<HTMLBqTreeItemElement>('bq-tree-item'));

    await userEvent.click(getRow(items[0]));
    await waitForChanges();

    expect(items[0].expanded).toBe(true);
    expect(items[0].selected).toBe(false);
  });

  it('navigates visible items with arrow keys', async () => {
    const { root, waitForChanges } = await render(
      <bq-tree>
        <bq-tree-item>First</bq-tree-item>
        <bq-tree-item>Second</bq-tree-item>
      </bq-tree>,
    );
    await waitForStable(root);
    const items = Array.from(root.querySelectorAll<HTMLBqTreeItemElement>('bq-tree-item'));

    await userEvent.click(getRow(items[0]));
    await userEvent.keyboard('{ArrowDown}');
    await waitForChanges();

    expect(items[1]).toEqualAttribute('tabindex', '0');
    expect(document.activeElement).toBe(items[1]);
  });

  it('starts lazy loading with ArrowRight', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <bq-tree>
        <bq-tree-item lazy>Remote</bq-tree-item>
      </bq-tree>,
    );
    const item = root.querySelector<HTMLBqTreeItemElement>('bq-tree-item');
    const lazyLoad = spyOnEvent('bqLazyLoad');

    await userEvent.click(getRow(item));
    await userEvent.keyboard('{ArrowRight}');
    await waitForChanges();

    expect(lazyLoad).toHaveReceivedEventTimes(1);
  });
});
