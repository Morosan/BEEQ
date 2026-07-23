import type { EventEmitter } from '@stencil/core';
import { Component, Element, Event, Host, h, Listen, Prop, Watch } from '@stencil/core';

import { isHTMLElement, validatePropValue } from '../../shared/utils';
import type { TTreeSelection, TTreeSelectionChangeEventDetail, TTreeSize } from './bq-tree.types';
import { TREE_SELECTION, TREE_SIZE } from './bq-tree.types';

type TreeItemElement = HTMLBqTreeItemElement & {
  disabled: boolean;
  expanded: boolean;
  indeterminate: boolean;
  lazy: boolean;
  selected: boolean;
  tabIndex: number;
  vFocus: () => Promise<void>;
};

/**
 * Trees display hierarchical collections of selectable items that can be expanded and collapsed.
 *
 * @example How to use it
 * ```html
 * <bq-tree selection="single">
 *   <bq-tree-item expanded>Parent<bq-tree-item>Child</bq-tree-item></bq-tree-item>
 * </bq-tree>
 * ```
 *
 * @documentation https://www.beeq.design/
 * @status progress
 *
 * @dependency bq-tree-item
 *
 * @attr {"single" | "multiple" | "leaf" | "leaf-multiple"} [selection="single"] - The selection behavior of the tree.
 * @attr {"small" | "medium" | "large"} [size="medium"] - The size of the tree and its items.
 *
 * @event bqSelectionChange - Emitted when the tree selection changes.
 *
 * @slot - One or more `bq-tree-item` elements.
 *
 * @part base - The component's tree container.
 *
 * @cssprop --bq-tree--indent-guide-color - The color of nested indentation guides.
 * @cssprop --bq-tree--indent-guide-offset - The vertical inset of indentation guides.
 * @cssprop --bq-tree--indent-guide-style - The line style of indentation guides.
 * @cssprop --bq-tree--indent-guide-width - The width of indentation guides.
 * @cssprop --bq-tree--indent-size - The indentation applied to each nested level.
 * @cssprop --bq-tree--item-font-size - The item label font size.
 * @cssprop --bq-tree--item-height - The minimum item row height.
 */
@Component({
  tag: 'bq-tree',
  styleUrl: './scss/bq-tree.scss',
  shadow: true,
})
export class BqTree {
  // Own Properties
  // ====================

  private mutationObserver?: MutationObserver;

  // Reference to host HTML element
  // ===================================

  @Element() el!: HTMLBqTreeElement;

  // State() variables
  // Inlined decorator, alphabetical order
  // =======================================

  // Public Property API
  // ========================

  /** The selection behavior of the tree. */
  @Prop({ reflect: true, mutable: true }) selection: TTreeSelection = 'single';

  /** The size of the tree and its items. */
  @Prop({ reflect: true, mutable: true }) size: TTreeSize = 'medium';

  // Prop lifecycle events
  // =======================

  @Watch('selection')
  handleSelectionChange() {
    validatePropValue(
      TREE_SELECTION,
      'single',
      this.el as HTMLBqTreeElement & { selection: TTreeSelection },
      'selection',
    );
    this.treeItems.forEach((item) => {
      item.setAttribute('data-tree-selection', this.selection);
      item.indeterminate = false;
    });
    this.normalizeSelection();
  }

  @Watch('size')
  handleSizeChange() {
    validatePropValue(TREE_SIZE, 'medium', this.el as HTMLBqTreeElement & { size: TTreeSize }, 'size');
  }

  // Events section
  // Requires JSDocs for public API documentation
  // ==============================================

  /** Emitted when the tree selection changes. */
  @Event() bqSelectionChange: EventEmitter<TTreeSelectionChangeEventDetail>;

  // Component lifecycle events
  // Ordered by their natural call order
  // =====================================

  componentWillLoad() {
    this.handleSizeChange();
    this.handleSelectionChange();
  }

  componentDidLoad() {
    this.syncItems();
    if (typeof MutationObserver === 'undefined') return;
    this.mutationObserver = new MutationObserver(this.syncItems);
    this.mutationObserver.observe(this.el, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.mutationObserver?.disconnect();
  }

  // Listeners
  // ==============

  @Listen('bqTreeItemFocus')
  onTreeItemFocus(event: CustomEvent<HTMLBqTreeItemElement>) {
    event.stopPropagation();
    if (!this.containsItem(event.detail)) return;
    this.setCurrentItem(event.detail as TreeItemElement);
  }

  @Listen('bqTreeItemSelect')
  onTreeItemSelect(event: CustomEvent<HTMLBqTreeItemElement>) {
    event.stopPropagation();
    const item = event.detail as TreeItemElement;
    if (!this.containsItem(item) || item.disabled) return;

    if ((this.selection === 'leaf' || this.selection === 'leaf-multiple') && this.hasChildren(item)) {
      this.toggleItem(item);
      return;
    }

    if (this.selection === 'single' || this.selection === 'leaf') {
      this.treeItems.forEach((treeItem) => {
        treeItem.selected = treeItem === item;
      });
    } else {
      item.selected = !item.selected;
      item.indeterminate = false;
      if (this.selection === 'multiple') {
        this.getDescendants(item).forEach((child) => {
          if (!child.disabled) child.selected = item.selected;
        });
        this.updateAncestorSelection(item);
      }
    }

    this.bqSelectionChange.emit({ item, selectedItems: this.selectedItems });
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    const item = event.composedPath().find((node) => isHTMLElement(node, 'bq-tree-item')) as
      | TreeItemElement
      | undefined;
    if (!item || !this.containsItem(item)) return;

    const visibleItems = this.visibleItems;
    const currentIndex = visibleItems.indexOf(item);
    let nextItem: TreeItemElement | undefined;

    switch (event.key) {
      case 'ArrowDown':
        nextItem = visibleItems[Math.min(currentIndex + 1, visibleItems.length - 1)];
        break;
      case 'ArrowUp':
        nextItem = visibleItems[Math.max(currentIndex - 1, 0)];
        break;
      case 'Home':
        nextItem = visibleItems[0];
        break;
      case 'End':
        nextItem = visibleItems.at(-1);
        break;
      case 'ArrowRight':
        if (this.hasChildren(item) && !item.expanded) this.toggleItem(item);
        else nextItem = this.getDirectChildren(item).find((child) => !child.disabled);
        break;
      case 'ArrowLeft':
        if (this.hasChildren(item) && item.expanded) this.toggleItem(item);
        else nextItem = this.getParentItem(item);
        break;
      case 'Enter':
      case ' ':
        item.click();
        break;
      case '*':
        this.getDirectChildren(this.getParentItem(item)).forEach((sibling) => {
          if (this.hasChildren(sibling)) sibling.expanded = true;
        });
        break;
      default:
        return;
    }

    event.preventDefault();
    nextItem?.vFocus();
  }

  // Public methods API
  // These methods are exposed on the host element.
  // Always use two lines.
  // Public Methods must be async.
  // Requires JSDocs for public API documentation.
  // ===============================================

  // Local methods
  // Internal business logic.
  // These methods cannot be called from the host element.
  // =======================================================

  private get treeItems(): TreeItemElement[] {
    return Array.from(this.el.querySelectorAll('bq-tree-item')) as TreeItemElement[];
  }

  private get selectedItems(): HTMLBqTreeItemElement[] {
    return this.treeItems.filter((item) => item.selected);
  }

  private get visibleItems(): TreeItemElement[] {
    return this.treeItems.filter((item) => {
      if (item.disabled) return false;
      let parent = this.getParentItem(item);
      while (parent) {
        if (!parent.expanded) return false;
        parent = this.getParentItem(parent);
      }
      return true;
    });
  }

  private containsItem = (item?: HTMLBqTreeItemElement) => !!item && item.closest('bq-tree') === this.el;

  private getDirectChildren = (item?: HTMLBqTreeItemElement): TreeItemElement[] => {
    const container: ParentNode = item ?? this.el;
    return Array.from(container.children).filter((child) => isHTMLElement(child, 'bq-tree-item')) as TreeItemElement[];
  };

  private getDescendants = (item: HTMLBqTreeItemElement) =>
    Array.from(item.querySelectorAll<HTMLBqTreeItemElement>('bq-tree-item')) as TreeItemElement[];

  private getParentItem = (item: HTMLBqTreeItemElement): TreeItemElement | undefined => {
    const parent = item.parentElement?.closest('bq-tree-item') as TreeItemElement | null;
    return parent && this.containsItem(parent) ? parent : undefined;
  };

  private hasChildren = (item: TreeItemElement) => item.lazy || this.getDirectChildren(item).length > 0;

  private normalizeSelection = () => {
    const selectableItems = this.treeItems.filter((item) => {
      return (
        !item.disabled &&
        (!(this.selection === 'leaf' || this.selection === 'leaf-multiple') || !this.hasChildren(item))
      );
    });
    if (this.selection === 'single' || this.selection === 'leaf') {
      const selected = selectableItems.find((item) => item.selected);
      this.treeItems.forEach((item) => {
        item.selected = item === selected;
      });
    } else if (this.selection === 'leaf-multiple') {
      this.treeItems
        .filter((item) => this.hasChildren(item))
        .forEach((item) => {
          item.selected = false;
        });
    }
  };

  private setCurrentItem = (current: TreeItemElement) => {
    this.treeItems.forEach((item) => {
      item.tabIndex = item === current && !item.disabled ? 0 : -1;
    });
  };

  private syncItems = () => {
    this.treeItems.forEach((item) => {
      item.setAttribute('data-tree-selection', this.selection);
    });
    this.normalizeSelection();
    const current = this.treeItems.find((item) => item.tabIndex === 0 && !item.disabled) ?? this.visibleItems[0];
    if (current) this.setCurrentItem(current);
  };

  private toggleItem = (item: TreeItemElement) => {
    item.dispatchEvent(new CustomEvent('bqTreeItemToggle'));
  };

  private updateAncestorSelection = (item: TreeItemElement) => {
    let parent = this.getParentItem(item);
    while (parent) {
      const children = this.getDirectChildren(parent).filter((child) => !child.disabled);
      const allSelected = children.length > 0 && children.every((child) => child.selected);
      const someSelected = children.some((child) => child.selected || child.indeterminate);
      parent.selected = allSelected;
      parent.indeterminate = !allSelected && someSelected;
      parent = this.getParentItem(parent);
    }
  };

  // render() function
  // Always the last one in the class.
  // ===================================

  render() {
    return (
      <Host aria-multiselectable={this.selection.includes('multiple') ? 'true' : 'false'} role="tree">
        <div class="bq-tree" part="base">
          <slot onSlotchange={this.syncItems} />
        </div>
      </Host>
    );
  }
}
