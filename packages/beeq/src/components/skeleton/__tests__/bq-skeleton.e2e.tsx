import { h } from '@stencil/core';
import { afterEach, describe, expect, it, render, vi } from '@stencil/vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('bq-skeleton', () => {
  it('should render', async () => {
    const { root } = await render(<bq-skeleton />);

    expect(root).not.toBeNull();
  });

  it('should have shadow root', async () => {
    const { root } = await render(<bq-skeleton />);

    expect(root).toHaveShadowRoot();
  });

  it('should hide the skeleton from assistive technologies', async () => {
    const { root } = await render(<bq-skeleton />);

    expect(root).toEqualAttribute('aria-hidden', 'true');
  });

  it('should render with default props', async () => {
    const { root } = await render(<bq-skeleton />);
    const skeleton = root.shadowRoot.querySelector('.bq-skeleton') as HTMLSpanElement;

    expect(root).toEqualAttribute('effect', 'none');
    expect(root).toEqualAttribute('shape', 'rectangle');
    expect(skeleton).toHaveClass('effect--none');
    expect(skeleton).toHaveClass('shape--rectangle');
  });

  it('should apply effect and shape classes', async () => {
    const { root } = await render(<bq-skeleton effect="sheen" shape="circle" />);
    const skeleton = root.shadowRoot.querySelector('.bq-skeleton') as HTMLSpanElement;

    expect(skeleton).toHaveClass('effect--sheen');
    expect(skeleton).toHaveClass('shape--circle');
  });

  it('should apply width and height as CSS variables', async () => {
    const { root } = await render(<bq-skeleton height="3rem" width="12rem" />);

    expect(root).toEqualAttribute('height', '3rem');
    expect(root).toEqualAttribute('width', '12rem');
    expect(root.style.getPropertyValue('--bq-skeleton--height')).toBe('3rem');
    expect(root.style.getPropertyValue('--bq-skeleton--width')).toBe('12rem');
  });

  it('should handle invalid effect values', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { root, setProps } = await render(<bq-skeleton effect="pulse" />);
    const skeleton = root as HTMLBqSkeletonElement;

    await setProps({ effect: 'invalid' as HTMLBqSkeletonElement['effect'] });

    expect(skeleton.effect).toBe('none');
    expect(skeleton).toEqualAttribute('effect', 'none');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('[BQ-SKELETON] Please notice that "effect" should be one of none|pulse|sheen');
  });

  it('should handle invalid shape values', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { root, setProps } = await render(<bq-skeleton shape="text" />);
    const skeleton = root as HTMLBqSkeletonElement;

    await setProps({ shape: 'invalid' as HTMLBqSkeletonElement['shape'] });

    expect(skeleton.shape).toBe('rectangle');
    expect(skeleton).toEqualAttribute('shape', 'rectangle');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      '[BQ-SKELETON] Please notice that "shape" should be one of rectangle|circle|text',
    );
  });
});
