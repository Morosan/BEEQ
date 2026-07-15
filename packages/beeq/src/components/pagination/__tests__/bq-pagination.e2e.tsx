import { h } from '@stencil/core';
import { afterEach, describe, expect, it, render, vi, waitForStable } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

import { getTextContent } from '../../../shared/utils/slot';

const getPreviousButton = (pagination: HTMLBqPaginationElement) =>
  pagination.shadowRoot?.querySelector<HTMLButtonElement>('[part="previous-button"]');

const getNextButton = (pagination: HTMLBqPaginationElement) =>
  pagination.shadowRoot?.querySelector<HTMLButtonElement>('[part="next-button"]');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('bq-pagination', () => {
  it('should render', async () => {
    const { root } = await render(<bq-pagination />);
    expect(root).not.toBeNull();
  });

  it('should have shadow root', async () => {
    const { root } = await render(<bq-pagination />);

    expect(root).toHaveShadowRoot();
  });

  it('should reflect public props', async () => {
    const { root } = await render(
      <bq-pagination
        arrows
        boundaryCount={2}
        disabled
        label="Results pages"
        page={3}
        pages={8}
        siblingCount={2}
        size="small"
      />,
    );

    expect(root).toHaveAttribute('arrows');
    expect(root).toEqualAttribute('boundary-count', '2');
    expect(root).toHaveAttribute('disabled');
    expect(root).toEqualAttribute('label', 'Results pages');
    expect(root).toEqualAttribute('page', '3');
    expect(root).toEqualAttribute('pages', '8');
    expect(root).toEqualAttribute('sibling-count', '2');
    expect(root).toEqualAttribute('size', 'small');
  });

  it('should render custom previous and next icon slot content', async () => {
    const { root } = await render(
      <bq-pagination>
        <span slot="previous-icon">Previous</span>
        <span slot="next-icon">Next</span>
      </bq-pagination>,
    );
    const previousSlot = root.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="previous-icon"]');
    const nextSlot = root.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="next-icon"]');

    expect(getTextContent(previousSlot, { recurse: true })).toBe('Previous');
    expect(getTextContent(nextSlot, { recurse: true })).toBe('Next');
  });

  it('should render page buttons and ellipsis', async () => {
    const { root } = await render(<bq-pagination page={5} pages={10} />);
    const buttons = root.shadowRoot?.querySelectorAll<HTMLButtonElement>('[part="button"]');
    const ellipsis = root.shadowRoot?.querySelectorAll('[part="ellipsis"]');

    expect(buttons).toHaveLength(5);
    expect(ellipsis).toHaveLength(2);
  });

  it('should render arrow controls by default', async () => {
    const { root } = await render(<bq-pagination page={3} pages={5} />);
    const pagination = root as HTMLBqPaginationElement;

    expect(getPreviousButton(pagination)).not.toBeNull();
    expect(getNextButton(pagination)).not.toBeNull();
  });

  it('should hide arrow controls when arrows is false', async () => {
    const { root } = await render(<bq-pagination arrows={false} page={3} pages={5} />);
    const pagination = root as HTMLBqPaginationElement;

    expect(root).not.toHaveAttribute('arrows');
    expect(getPreviousButton(pagination)).toBeNull();
    expect(getNextButton(pagination)).toBeNull();
    expect(root.shadowRoot?.querySelectorAll<HTMLButtonElement>('[part="button"]')).toHaveLength(5);
  });

  it('should set aria-current on the selected page', async () => {
    const { root } = await render(<bq-pagination page={3} pages={5} />);
    const currentPage = root.shadowRoot?.querySelector<HTMLButtonElement>('[aria-current="page"]');

    expect(currentPage).not.toBeNull();
    expect(currentPage).toEqualText('3');
  });

  it('should emit bqChange and update the selected page', async () => {
    const { root, spyOnEvent } = await render(<bq-pagination page={1} pages={5} />);
    const bqChange = spyOnEvent('bqChange');
    const nextButton = getNextButton(root as HTMLBqPaginationElement);

    await userEvent.click(nextButton);
    await waitForStable(root);

    expect(bqChange).toHaveReceivedEventDetail({ page: 2 });
    expect((root as HTMLBqPaginationElement).page).toBe(2);
  });

  it('should go to a page using the public method', async () => {
    const { root } = await render(<bq-pagination page={1} pages={5} />);

    await (root as HTMLBqPaginationElement).goToPage(4);
    await waitForStable(root);

    expect((root as HTMLBqPaginationElement).page).toBe(4);
  });

  it('should go to the next and previous page using public methods', async () => {
    const { root } = await render(<bq-pagination page={2} pages={5} />);
    const pagination = root as HTMLBqPaginationElement;

    await pagination.nextPage();
    await waitForStable(root);
    expect(pagination.page).toBe(3);

    await pagination.previousPage();
    await waitForStable(root);
    expect(pagination.page).toBe(2);
  });

  it('should not emit bqChange when disabled', async () => {
    const { root, spyOnEvent } = await render(<bq-pagination disabled page={1} pages={5} />);
    const bqChange = spyOnEvent('bqChange');

    await (root as HTMLBqPaginationElement).goToPage(2);

    expect(bqChange).toHaveReceivedEventTimes(0);
    expect((root as HTMLBqPaginationElement).page).toBe(1);
  });

  it('should disable previous and next controls at pagination boundaries', async () => {
    const { root, setProps } = await render(<bq-pagination page={1} pages={2} />);
    const pagination = root as HTMLBqPaginationElement;

    expect(getPreviousButton(pagination)).toBeDisabled();
    expect(getNextButton(pagination)).not.toBeDisabled();

    await setProps({ page: 2 });
    await waitForStable(root);

    expect(getPreviousButton(pagination)).not.toBeDisabled();
    expect(getNextButton(pagination)).toBeDisabled();
  });

  it('should be keyboard accessible', async () => {
    const { root, spyOnEvent } = await render(<bq-pagination page={1} pages={5} />);
    const bqChange = spyOnEvent('bqChange');

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await waitForStable(root);

    expect(bqChange).toHaveReceivedEventDetail({ page: 2 });
    expect((root as HTMLBqPaginationElement).page).toBe(2);
  });

  it('should validate size property', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { root } = await render(<bq-pagination size="invalid" />);

    expect((root as HTMLBqPaginationElement).size).toBe('medium');
    expect(warnSpy).toHaveBeenCalledWith('[BQ-PAGINATION] Please notice that "size" should be one of small|medium');
  });
});
