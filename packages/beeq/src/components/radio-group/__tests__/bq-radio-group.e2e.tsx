import { h } from '@stencil/core';
import { describe, expect, it, render, waitForStable } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const getRadio = (element: ParentNode, value: string) =>
  element.querySelector(`bq-radio[value="${value}"]`) as HTMLBqRadioElement;

describe('bq-radio-group', () => {
  it('should render', async () => {
    const { root } = await render(<bq-radio-group />);

    expect(root).not.toBeNull();
  });

  it('should have shadow root', async () => {
    const { root } = await render(<bq-radio-group />);

    expect(root.shadowRoot).not.toBeNull();
  });

  it('should set the value when a radio is clicked', async () => {
    const { root, waitForChanges } = await render(
      <bq-radio-group name="test-option">
        <bq-radio value="option1">Option 1</bq-radio>
        <bq-radio value="option2">Option 2</bq-radio>
      </bq-radio-group>,
    );

    await getRadio(root, 'option2').vClick();
    await waitForChanges();

    expect(root).toHaveAttribute('value', 'option2');
    expect(root.value).toBe('option2');
    expect(getRadio(root, 'option2')).toHaveAttribute('checked');
  });

  it('should become valid only after one option is selected when required', async () => {
    const { root, waitForChanges } = await render(
      <form>
        <bq-radio-group name="test-option" required>
          <bq-radio value="option1">Option 1</bq-radio>
          <bq-radio value="option2">Option 2</bq-radio>
          <bq-radio value="option3">Option 3</bq-radio>
        </bq-radio-group>
        <button type="submit">Submit</button>
      </form>,
    );
    const form = root as HTMLFormElement;
    const radioGroup = form.querySelector('bq-radio-group') as HTMLBqRadioGroupElement;

    await waitForStable(radioGroup);

    expect(form.checkValidity()).toBe(false);
    expect(radioGroup.value).toBeUndefined();

    await getRadio(form, 'option2').vClick();
    await waitForChanges();

    expect(form.checkValidity()).toBe(true);
    expect(radioGroup).toHaveAttribute('value', 'option2');
  });

  it('should check a radio when the value property is set', async () => {
    const { root } = await render(
      <bq-radio-group name="test-option" value="option2">
        <bq-radio value="option1">Option 1</bq-radio>
        <bq-radio value="option2">Option 2</bq-radio>
        <bq-radio value="option3">Option 3</bq-radio>
      </bq-radio-group>,
    );

    await waitForStable(root);

    expect(getRadio(root, 'option1').checked).toBe(false);
    expect(getRadio(root, 'option2').checked).toBe(true);
    expect(getRadio(root, 'option3').checked).toBe(false);
  });

  it('should keep a single checked radio while switching selection', async () => {
    const { root, waitForChanges } = await render(
      <bq-radio-group name="test-option">
        <bq-radio value="option1">Option 1</bq-radio>
        <bq-radio value="option2">Option 2</bq-radio>
        <bq-radio value="option3">Option 3</bq-radio>
      </bq-radio-group>,
    );

    await getRadio(root, 'option1').vClick();
    await waitForChanges();
    expect(root.value).toBe('option1');
    expect(getRadio(root, 'option1').checked).toBe(true);

    await getRadio(root, 'option2').vClick();
    await waitForChanges();
    expect(root.value).toBe('option2');
    expect(getRadio(root, 'option1').checked).toBe(false);
    expect(getRadio(root, 'option2').checked).toBe(true);

    await getRadio(root, 'option3').vClick();
    await waitForChanges();
    expect(root.value).toBe('option3');
    expect(getRadio(root, 'option2').checked).toBe(false);
    expect(getRadio(root, 'option3').checked).toBe(true);
  });

  it('should emit bqChange when a radio is clicked', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <bq-radio-group name="test-option">
        <bq-radio value="option1">Option 1</bq-radio>
        <bq-radio value="option2">Option 2</bq-radio>
        <bq-radio value="option3">Option 3</bq-radio>
      </bq-radio-group>,
    );
    const bqChange = spyOnEvent('bqChange');

    await getRadio(root, 'option1').vClick();
    await waitForChanges();

    expect(bqChange).toHaveReceivedEventTimes(1);
  });

  it('should debounce bqChange and emit only the final value', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <bq-radio-group debounceTime={150} name="test-option">
        <bq-radio value="option1">Option 1</bq-radio>
        <bq-radio value="option2">Option 2</bq-radio>
        <bq-radio value="option3">Option 3</bq-radio>
      </bq-radio-group>,
    );
    const bqChange = spyOnEvent('bqChange');

    await getRadio(root, 'option1').vClick();
    await getRadio(root, 'option2').vClick();
    await getRadio(root, 'option3').vClick();
    await waitForChanges();
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(bqChange).toHaveReceivedEventTimes(1);
    expect(root.value).toBe('option3');
    expect(root).toHaveAttribute('value', 'option3');
  });

  it('should support keyboard navigation across the radios', async () => {
    const { root, waitForChanges } = await render(
      <bq-radio-group name="test-option">
        <bq-radio value="option1">Option 1</bq-radio>
        <bq-radio value="option2">Option 2</bq-radio>
        <bq-radio value="option3">Option 3</bq-radio>
      </bq-radio-group>,
    );

    await getRadio(root, 'option1').vFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitForChanges();

    expect(root.value).toBe('option2');
    expect(getRadio(root, 'option2')).toHaveAttribute('checked');

    await userEvent.keyboard('{ArrowDown}');
    await waitForChanges();

    expect(root.value).toBe('option3');
    expect(getRadio(root, 'option3')).toHaveAttribute('checked');

    await userEvent.keyboard('{ArrowDown}');
    await waitForChanges();

    expect(root.value).toBe('option1');
    expect(getRadio(root, 'option1')).toHaveAttribute('checked');
  });
});
