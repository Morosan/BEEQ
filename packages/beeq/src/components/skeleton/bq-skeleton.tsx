import { Component, Element, Host, h, Prop, Watch } from '@stencil/core';

import { validatePropValue } from '../../shared/utils';
import type { TSkeletonEffect, TSkeletonShape } from './bq-skeleton.types';
import { SKELETON_EFFECT, SKELETON_SHAPE } from './bq-skeleton.types';

/**
 * The Skeleton component is a visual placeholder that previews where content will appear while it loads.
 *
 * @example How to use it
 * ```html
 * <bq-skeleton effect="sheen"></bq-skeleton>
 * ```
 *
 * @documentation https://www.beeq.design/
 * @status progress
 *
 * @attr {"none" | "pulse" | "sheen"} effect - The animation effect applied to the skeleton.
 * @attr {string} height - The skeleton height.
 * @attr {"rectangle" | "circle" | "text"} shape - The skeleton shape.
 * @attr {string} width - The skeleton width.
 *
 * @part indicator - The skeleton indicator responsible for color, shape, and animation.
 *
 * @cssprop --bq-skeleton--background-color - The skeleton background color.
 * @cssprop --bq-skeleton--border-radius - The skeleton border radius.
 * @cssprop --bq-skeleton--border-radius-circle - The skeleton circle border radius.
 * @cssprop --bq-skeleton--border-radius-text - The skeleton text border radius.
 * @cssprop --bq-skeleton--height - The skeleton height.
 * @cssprop --bq-skeleton--sheen-color - The skeleton sheen animation color.
 * @cssprop --bq-skeleton--width - The skeleton width.
 */
@Component({
  tag: 'bq-skeleton',
  styleUrl: './scss/bq-skeleton.scss',
  shadow: true,
})
export class BqSkeleton {
  // Own Properties
  // ====================

  // Reference to host HTML element
  // ===================================

  @Element() el!: HTMLBqSkeletonElement;

  // State() variables
  // Inlined decorator, alphabetical order
  // =======================================

  // Public Property API
  // ========================

  /** The animation effect applied to the skeleton */
  @Prop({ mutable: true, reflect: true }) effect: TSkeletonEffect = 'none';

  /** The skeleton height */
  @Prop({ reflect: true }) height = '1rem';

  /** The skeleton shape */
  @Prop({ mutable: true, reflect: true }) shape: TSkeletonShape = 'rectangle';

  /** The skeleton width */
  @Prop({ reflect: true }) width = '100%';

  // Prop lifecycle events
  // =======================

  @Watch('effect')
  handleEffectPropChange() {
    validatePropValue(SKELETON_EFFECT, 'none', this.el, 'effect');
  }

  @Watch('shape')
  handleShapePropChange() {
    validatePropValue(SKELETON_SHAPE, 'rectangle', this.el, 'shape');
  }

  // Events section
  // Requires JSDocs for public API documentation
  // ==============================================

  // Component lifecycle events
  // Ordered by their natural call order
  // =====================================

  componentWillLoad() {
    this.checkPropValues();
  }

  // Listeners
  // ==============

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

  private checkPropValues = (): void => {
    validatePropValue(SKELETON_EFFECT, 'none', this.el, 'effect');
    validatePropValue(SKELETON_SHAPE, 'rectangle', this.el, 'shape');
  };

  // render() function
  // Always the last one in the class.
  // ===================================

  render() {
    const styles = {
      '--bq-skeleton--height': this.height,
      '--bq-skeleton--width': this.width,
    };

    return (
      <Host aria-hidden="true" style={styles}>
        <span
          class={{
            'bq-skeleton': true,
            [`effect--${this.effect}`]: true,
            [`shape--${this.shape}`]: true,
          }}
          part="indicator"
        ></span>
      </Host>
    );
  }
}
