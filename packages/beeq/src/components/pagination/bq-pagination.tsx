import type { EventEmitter } from '@stencil/core';
import { Component, Element, Event, Host, h, Method, Prop, Watch } from '@stencil/core';

import { validatePropValue } from '../../shared/utils';
import type { TPaginationChange, TPaginationItem, TPaginationSize } from './bq-pagination.types';
import { PAGINATION_SIZE } from './bq-pagination.types';

/**
 * The Pagination component lets users navigate through a collection split into pages.
 *
 * @example How to use it
 * ```html
 * <bq-pagination page="1" pages="10"></bq-pagination>
 * ```
 *
 * @documentation https://www.beeq.design/
 * @status progress
 *
 * @dependency bq-icon
 *
 * @attr {boolean} arrows - If `true`, it shows previous and next arrow controls.
 * @attr {number} boundary-count - Number of always-visible pages at the beginning and end.
 * @attr {boolean} disabled - If `true`, pagination controls cannot be interacted with.
 * @attr {string} label - The `aria-label` attribute used to describe the pagination navigation.
 * @attr {number} page - The currently selected page.
 * @attr {number} pages - The total number of pages.
 * @attr {number} sibling-count - Number of pages to show before and after the current page.
 * @attr {"small" | "medium"} size - The size of the pagination controls.
 *
 * @event bqChange - Handler to be called when the selected page changes.
 *
 * @method goToPage() - Go to a specific page.
 * @method nextPage() - Go to the next page.
 * @method previousPage() - Go to the previous page.
 *
 * @slot previous-icon - The icon content for the previous page control.
 * @slot next-icon - The icon content for the next page control.
 *
 * @part navigation - The `nav` element that wraps the pagination controls.
 * @part list - The `ul` element that contains the pagination items.
 * @part item - The `li` element that wraps each pagination control.
 * @part button - The page button elements.
 * @part previous-button - The previous page button element.
 * @part next-button - The next page button element.
 * @part ellipsis - The ellipsis element.
 *
 * @cssprop --bq-pagination--border-radius - Pagination control border radius.
 * @cssprop --bq-pagination--gap - Gap between pagination controls.
 * @cssprop --bq-pagination--small-control-size - Small pagination control size.
 * @cssprop --bq-pagination--small-font-size - Small pagination font size.
 * @cssprop --bq-pagination--medium-control-size - Medium pagination control size.
 * @cssprop --bq-pagination--medium-font-size - Medium pagination font size.
 */
@Component({
  tag: 'bq-pagination',
  styleUrl: './scss/bq-pagination.scss',
  shadow: {
    delegatesFocus: true,
  },
})
export class BqPagination {
  // Own Properties
  // ====================

  // Reference to host HTML element
  // ===================================

  @Element() el!: HTMLBqPaginationElement;

  // State() variables
  // Inlined decorator, alphabetical order
  // =======================================

  // Public Property API
  // ========================

  /** If `true`, it shows previous and next arrow controls */
  @Prop({ reflect: true }) arrows: boolean = true;

  /** Number of always-visible pages at the beginning and end */
  @Prop({ reflect: true }) boundaryCount: number = 1;

  /** If `true`, pagination controls cannot be interacted with */
  @Prop({ reflect: true }) disabled: boolean = false;

  /** The `aria-label` attribute used to describe the pagination navigation */
  @Prop({ reflect: true }) label: string = 'Pagination';

  /** The currently selected page */
  @Prop({ mutable: true, reflect: true }) page: number = 1;

  /** The total number of pages */
  @Prop({ reflect: true }) pages: number = 1;

  /** Number of pages to show before and after the current page */
  @Prop({ reflect: true }) siblingCount: number = 1;

  /** The size of the pagination controls */
  @Prop({ reflect: true }) size: TPaginationSize = 'medium';

  // Prop lifecycle events
  // =======================

  @Watch('size')
  checkPropValues() {
    validatePropValue(PAGINATION_SIZE, 'medium', this.el, 'size');
  }

  @Watch('boundaryCount')
  @Watch('page')
  @Watch('pages')
  @Watch('siblingCount')
  handlePaginationPropsChange() {
    const currentPage = this.currentPage;

    if (this.page !== currentPage) {
      this.page = currentPage;
    }
  }

  // Events section
  // Requires JSDocs for public API documentation
  // ==============================================

  /** Handler to be called when the selected page changes. */
  @Event({ cancelable: true }) bqChange: EventEmitter<TPaginationChange>;

  // Component lifecycle events
  // Ordered by their natural call order
  // =====================================

  componentWillLoad() {
    this.checkPropValues();
    this.handlePaginationPropsChange();
  }

  // Listeners
  // ==============

  // Public methods API
  // These methods are exposed on the host element.
  // Always use two lines.
  // Public Methods must be async.
  // Requires JSDocs for public API documentation.
  // ===============================================

  /**
   * Go to a specific page.
   * @param page - The page number to select.
   * @returns A promise that resolves when the page update has been handled.
   */
  @Method()
  async goToPage(page: number): Promise<void> {
    this.setPage(page);
  }

  /**
   * Go to the next page.
   * @returns A promise that resolves when the page update has been handled.
   */
  @Method()
  async nextPage(): Promise<void> {
    this.setPage(this.currentPage + 1);
  }

  /**
   * Go to the previous page.
   * @returns A promise that resolves when the page update has been handled.
   */
  @Method()
  async previousPage(): Promise<void> {
    this.setPage(this.currentPage - 1);
  }

  // Local methods
  // Internal business logic.
  // These methods cannot be called from the host element.
  // =======================================================

  private clampPage = (page: number): number => {
    const normalizedPage = this.normalizeNumber(page, 1);
    return Math.min(Math.max(normalizedPage, 1), this.pageCount);
  };

  private createRange = (start: number, end: number): number[] => {
    if (end < start) return [];

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  };

  private handlePageClick = (page: number) => () => {
    this.setPage(page);
  };

  private normalizeNumber = (value: number, fallback: number): number => {
    const normalizedValue = Math.floor(Number(value));

    return Number.isFinite(normalizedValue) ? normalizedValue : fallback;
  };

  private renderNextButton = () => (
    <li class="bq-pagination__item" part="item">
      <button
        aria-label="Go to next page"
        class="bq-pagination__control"
        disabled={this.disabled || this.currentPage === this.pageCount}
        onClick={this.nextPage.bind(this)}
        part="next-button"
        type="button"
      >
        <slot name="next-icon">
          <bq-icon aria-hidden="true" name="caret-right" size="16"></bq-icon>
        </slot>
      </button>
    </li>
  );

  private renderPreviousButton = () => (
    <li class="bq-pagination__item" part="item">
      <button
        aria-label="Go to previous page"
        class="bq-pagination__control"
        disabled={this.disabled || this.currentPage === 1}
        onClick={this.previousPage.bind(this)}
        part="previous-button"
        type="button"
      >
        <slot name="previous-icon">
          <bq-icon aria-hidden="true" name="caret-left" size="16"></bq-icon>
        </slot>
      </button>
    </li>
  );

  private renderEllipsis = () => (
    <li class="bq-pagination__item" part="item">
      <span aria-hidden="true" class="bq-pagination__ellipsis" part="ellipsis">
        ...
      </span>
    </li>
  );

  private renderPageButton = (page: number) => {
    const isSelected = page === this.currentPage;

    return (
      <li class="bq-pagination__item" part="item">
        <button
          aria-current={isSelected ? 'page' : null}
          aria-label={isSelected ? `Current page, page ${page}` : `Go to page ${page}`}
          class={{
            'bq-pagination__control bq-pagination__page': true,
            'bq-pagination__control--selected': isSelected,
          }}
          disabled={this.disabled || isSelected}
          onClick={this.handlePageClick(page)}
          part="button"
          type="button"
        >
          {page}
        </button>
      </li>
    );
  };

  private setPage = (page: number): void => {
    const nextPage = this.clampPage(page);

    if (this.disabled || nextPage === this.currentPage) return;

    const changeEvent = this.bqChange.emit({ page: nextPage });
    if (changeEvent.defaultPrevented) return;

    this.page = nextPage;
  };

  private get boundaryPageCount(): number {
    return Math.max(0, this.normalizeNumber(this.boundaryCount, 1));
  }

  private get currentPage(): number {
    return this.clampPage(this.page);
  }

  private get pageCount(): number {
    return Math.max(1, this.normalizeNumber(this.pages, 1));
  }

  private get paginationItems(): TPaginationItem[] {
    const { boundaryPageCount, currentPage, pageCount, siblingPageCount } = this;
    const totalVisiblePages = boundaryPageCount * 2 + siblingPageCount * 2 + 3;

    if (pageCount <= totalVisiblePages) {
      return this.createRange(1, pageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingPageCount, boundaryPageCount + 1);
    const rightSiblingIndex = Math.min(currentPage + siblingPageCount, pageCount - boundaryPageCount);
    const showLeftEllipsis = leftSiblingIndex > boundaryPageCount + 2;
    const showRightEllipsis = rightSiblingIndex < pageCount - boundaryPageCount - 1;
    const firstPages = this.createRange(1, boundaryPageCount);
    const lastPages = this.createRange(pageCount - boundaryPageCount + 1, pageCount);

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = boundaryPageCount + siblingPageCount * 2 + 2;

      return [...this.createRange(1, leftItemCount), 'ellipsis', ...lastPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemCount = boundaryPageCount + siblingPageCount * 2 + 2;

      return [...firstPages, 'ellipsis', ...this.createRange(pageCount - rightItemCount + 1, pageCount)];
    }

    return [
      ...firstPages,
      'ellipsis',
      ...this.createRange(leftSiblingIndex, rightSiblingIndex),
      'ellipsis',
      ...lastPages,
    ];
  }

  private get siblingPageCount(): number {
    return Math.max(0, this.normalizeNumber(this.siblingCount, 1));
  }

  // render() function
  // Always the last one in the class.
  // ===================================

  render() {
    return (
      <Host>
        <nav aria-label={this.label} part="navigation">
          <ul
            class={{
              'bq-pagination': true,
              [`bq-pagination--${this.size}`]: true,
            }}
            part="list"
          >
            {this.arrows && this.renderPreviousButton()}

            {this.paginationItems.map((item) =>
              item === 'ellipsis' ? this.renderEllipsis() : this.renderPageButton(item),
            )}

            {this.arrows && this.renderNextButton()}
          </ul>
        </nav>
      </Host>
    );
  }
}
