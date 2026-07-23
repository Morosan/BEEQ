import type { EventEmitter } from '@stencil/core';
import { Component, Element, Event, Host, h, Listen, Method, Prop, State, Watch } from '@stencil/core';

type TreeItemElement = HTMLBqTreeItemElement & { disabled: boolean };

/**
 * A tree item represents one node in a hierarchical `bq-tree`.
 *
 * @example How to use it
 * ```html
 * <bq-tree-item expanded>Parent<bq-tree-item>Child</bq-tree-item></bq-tree-item>
 * ```
 *
 * @documentation https://www.beeq.design/
 * @status progress
 *
 * @dependency bq-icon
 * @dependency bq-spinner
 *
 * @attr {boolean} [disabled=false] - Disables the tree item.
 * @attr {boolean} [expanded=false] - Expands the tree item.
 * @attr {boolean} [indeterminate=false] - Displays an indeterminate selection state.
 * @attr {boolean} [lazy=false] - Enables lazy loading behavior.
 * @attr {boolean} [selected=false] - Displays the tree item as selected.
 * @attr {number} [tabindex=-1] - Sets the item in or out of the tree's roving tab order.
 *
 * @method getChildrenItems() - Gets the direct child tree items.
 * @method vFocus() - Moves focus to the tree item.
 *
 * @event bqAfterCollapse - Emitted after the tree item collapses.
 * @event bqAfterExpand - Emitted after the tree item expands.
 * @event bqCollapse - Emitted before the tree item collapses; cancelable.
 * @event bqExpand - Emitted before the tree item expands; cancelable.
 * @event bqLazyLoad - Emitted when a lazy item is expanded and needs its children loaded.
 *
 * @slot - The tree item label.
 * @slot collapse-icon - The icon displayed when the item is expanded.
 * @slot expand-icon - The icon displayed when the item is collapsed.
 * @slot prefix - Decorative content displayed before the label.
 * @slot suffix - Content displayed after the label.
 *
 * @part base - The component's base wrapper.
 * @part checkbox - The multiple-selection indicator.
 * @part children - The container for nested tree items.
 * @part expand-button - The expand and collapse control.
 * @part indentation - The nested item indentation container.
 * @part item - The selectable item row.
 * @part label - The tree item label.
 * @part prefix - The prefix content container.
 * @part spinner - The lazy-loading spinner.
 * @part suffix - The suffix content container.
 *
 * @cssprop --bq-tree-item--hide-duration - The collapse animation duration.
 * @cssprop --bq-tree-item--background - The default item background.
 * @cssprop --bq-tree-item--background-hover - The item background on hover.
 * @cssprop --bq-tree-item--background-selected - The selected item background.
 * @cssprop --bq-tree-item--border-radius - The item border radius.
 * @cssprop --bq-tree-item--checkbox-size - The multiple-selection indicator size.
 * @cssprop --bq-tree-item--gap - The gap between item content.
 * @cssprop --bq-tree-item--padding-inline - The item inline padding.
 * @cssprop --bq-tree-item--show-duration - The expand animation duration.
 * @cssprop --bq-tree-item--text-color - The default item text color.
 * @cssprop --bq-tree-item--text-color-selected - The selected item text color.
 */
@Component({
  tag: 'bq-tree-item',
  styleUrl: './scss/bq-tree-item.scss',
  shadow: { delegatesFocus: true },
})
export class BqTreeItem {
  // Own Properties
  // ====================

  private childrenObserver?: MutationObserver;
  private ignoreExpandedWatch = false;
  private itemElem?: HTMLDivElement;

  // Reference to host HTML element
  // ===================================

  @Element() el!: HTMLBqTreeItemElement;

  // State() variables
  // Inlined decorator, alphabetical order
  // =======================================

  @State() private hasChildren = false;
  @State() private loading = false;

  // Public Property API
  // ========================

  /** Disables the tree item. */
  @Prop({ reflect: true }) disabled: boolean = false;

  /** Expands the tree item. */
  @Prop({ reflect: true, mutable: true }) expanded: boolean = false;

  /** Displays an indeterminate selection state. */
  @Prop({ reflect: true, mutable: true }) indeterminate: boolean = false;

  /** Enables lazy loading behavior. */
  @Prop({ reflect: true, mutable: true }) lazy: boolean = false;

  /** Displays the tree item as selected. */
  @Prop({ reflect: true, mutable: true }) selected: boolean = false;

  /** Sets the item in or out of the tree's roving tab order. */
  @Prop({ reflect: true, mutable: true, attribute: 'tabindex' }) tabIndex: number = -1;

  // Prop lifecycle events
  // =======================

  @Watch('disabled')
  handleDisabledChange() {
    if (this.disabled) this.tabIndex = -1;
  }

  @Watch('expanded')
  handleExpandedChange() {
    if (this.ignoreExpandedWatch) return;
    const event = this.expanded ? this.bqExpand.emit(this.el) : this.bqCollapse.emit(this.el);
    if (event.defaultPrevented) {
      this.ignoreExpandedWatch = true;
      this.expanded = !this.expanded;
      this.ignoreExpandedWatch = false;
      return;
    }
    requestAnimationFrame(() =>
      this.expanded ? this.bqAfterExpand.emit(this.el) : this.bqAfterCollapse.emit(this.el),
    );
  }

  @Watch('lazy')
  handleLazyChange() {
    if (!this.lazy) this.loading = false;
    this.syncChildren();
  }

  // Events section
  // Requires JSDocs for public API documentation
  // ==============================================

  /** Emitted after the tree item collapses. */
  @Event() bqAfterCollapse: EventEmitter<HTMLBqTreeItemElement>;

  /** Emitted after the tree item expands. */
  @Event() bqAfterExpand: EventEmitter<HTMLBqTreeItemElement>;

  /** Emitted before the tree item collapses; cancel the event to keep it expanded. */
  @Event({ cancelable: true }) bqCollapse: EventEmitter<HTMLBqTreeItemElement>;

  /** Emitted before the tree item expands; cancel the event to keep it collapsed. */
  @Event({ cancelable: true }) bqExpand: EventEmitter<HTMLBqTreeItemElement>;

  /** Emitted when a lazy item needs its children loaded. */
  @Event() bqLazyLoad: EventEmitter<HTMLBqTreeItemElement>;

  // Component lifecycle events
  // Ordered by their natural call order
  // =====================================

  componentWillLoad() {
    this.syncChildren();
  }

  componentDidLoad() {
    if (typeof MutationObserver === 'undefined') return;
    this.childrenObserver = new MutationObserver(this.syncChildren);
    this.childrenObserver.observe(this.el, { childList: true });
  }

  disconnectedCallback() {
    this.childrenObserver?.disconnect();
  }

  // Listeners
  // ==============

  @Listen('bqTreeItemToggle')
  onTreeItemToggle(event: CustomEvent) {
    event.stopPropagation();
    this.toggleExpanded();
  }

  // Public methods API
  // These methods are exposed on the host element.
  // Always use two lines.
  // Public Methods must be async.
  // Requires JSDocs for public API documentation.
  // ===============================================

  /**
   * Gets the direct child tree items.
   *
   * @param options - Controls whether disabled children are included.
   * @returns A promise containing the direct child tree items.
   */
  @Method()
  async getChildrenItems(
    options: { includeDisabled?: boolean } = { includeDisabled: true },
  ): Promise<HTMLBqTreeItemElement[]> {
    const children = this.directChildren;
    return options.includeDisabled === false ? children.filter((item) => !item.disabled) : children;
  }

  /**
   * Moves focus to the tree item.
   *
   * @returns A promise that resolves after focus is moved.
   */
  @Method()
  async vFocus() {
    this.itemElem?.focus();
  }

  // Local methods
  // Internal business logic.
  // These methods cannot be called from the host element.
  // =======================================================

  private get directChildren(): TreeItemElement[] {
    return Array.from(this.el.children).filter(
      (child) => child.tagName.toLowerCase() === 'bq-tree-item',
    ) as TreeItemElement[];
  }

  private handleClick = (event: MouseEvent) => {
    if (this.disabled) return;
    const sourceItem = event
      .composedPath()
      .find((node) => node instanceof HTMLElement && node.tagName.toLowerCase() === 'bq-tree-item');
    if (sourceItem !== this.el) return;
    this.itemElem?.focus();
    const expandButton = event
      .composedPath()
      .find((node) => node instanceof HTMLElement && node.dataset?.treeExpandButton !== undefined);
    if (expandButton) {
      this.toggleExpanded();
      return;
    }
    const selection = this.el.getAttribute('data-tree-selection');
    if (this.hasChildren && (selection === 'leaf' || selection === 'leaf-multiple')) {
      this.toggleExpanded();
      return;
    }
    this.el.dispatchEvent(new CustomEvent('bqTreeItemSelect', { bubbles: true, composed: true, detail: this.el }));
  };

  private handleFocus = () => {
    if (this.disabled) return;
    this.el.dispatchEvent(new CustomEvent('bqTreeItemFocus', { bubbles: true, composed: true, detail: this.el }));
  };

  private syncChildren = () => {
    this.directChildren.forEach((item) => {
      item.slot = 'children';
    });
    this.hasChildren = this.directChildren.length > 0 || this.lazy;
    if (this.loading && this.directChildren.length > 0) {
      this.loading = false;
      this.expanded = true;
    }
  };

  private toggleExpanded = () => {
    if (!this.hasChildren || this.disabled) return;
    if (this.lazy && this.directChildren.length === 0) {
      if (!this.loading) {
        this.loading = true;
        this.bqLazyLoad.emit(this.el);
      }
      return;
    }
    this.expanded = !this.expanded;
  };

  // render() function
  // Always the last one in the class.
  // ===================================

  render() {
    return (
      <Host
        aria-disabled={this.disabled ? 'true' : 'false'}
        aria-expanded={this.hasChildren ? String(this.expanded) : undefined}
        aria-selected={String(this.selected)}
        data-has-children={String(this.hasChildren)}
        onClick={this.handleClick}
        onFocus={this.handleFocus}
        role="treeitem"
        tabindex={this.disabled ? -1 : this.tabIndex}
      >
        <div class="bq-tree-item" part="base">
          <div
            class={{ 'bq-tree-item__row': true, 'is-disabled': this.disabled, 'is-selected': this.selected }}
            part="item"
            ref={(element) => {
              this.itemElem = element;
            }}
            tabindex={-1}
          >
            <span class="bq-tree-item__indentation" part="indentation" />
            <span
              aria-hidden="true"
              class={{ 'bq-tree-item__expand': true, 'is-expanded': this.expanded, 'is-hidden': !this.hasChildren }}
              data-tree-expand-button
              part="expand-button"
            >
              {this.loading ? (
                <bq-spinner animation part="spinner" size="small" />
              ) : (
                <span class="bq-tree-item__expand-icon">
                  <slot name={this.expanded ? 'collapse-icon' : 'expand-icon'}>
                    <bq-icon name="caret-right" size="16" />
                  </slot>
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              class={{
                'bq-tree-item__checkbox': true,
                'is-checked': this.selected,
                'is-indeterminate': this.indeterminate,
              }}
              part="checkbox"
            >
              {(this.selected || this.indeterminate) && (
                <bq-icon name={this.indeterminate ? 'minus' : 'check'} size="12" />
              )}
            </span>
            <span class="bq-tree-item__prefix" part="prefix">
              <slot name="prefix" />
            </span>
            <span class="bq-tree-item__label" part="label">
              <slot />
            </span>
            <span class="bq-tree-item__suffix" part="suffix">
              <slot name="suffix" />
            </span>
          </div>
          <div class="bq-tree-item__children" part="children" role="group">
            <div class="bq-tree-item__children-inner">
              <slot name="children" />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
