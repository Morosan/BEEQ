# bq-tree



<!-- Auto Generated Below -->


## Overview

Trees display hierarchical collections of selectable items that can be expanded and collapsed.

## Properties

| Property    | Attribute   | Description                         | Type                                                  | Default    |
| ----------- | ----------- | ----------------------------------- | ----------------------------------------------------- | ---------- |
| `selection` | `selection` | The selection behavior of the tree. | `"leaf" \| "leaf-multiple" \| "multiple" \| "single"` | `'single'` |
| `size`      | `size`      | The size of the tree and its items. | `"large" \| "medium" \| "small"`                      | `'medium'` |


## Events

| Event               | Description                              | Type                                                                                    |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `bqSelectionChange` | Emitted when the tree selection changes. | `CustomEvent<{ item: HTMLBqTreeItemElement; selectedItems: HTMLBqTreeItemElement[]; }>` |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | One or more `bq-tree-item` elements. |


## Shadow Parts

| Part     | Description                     |
| -------- | ------------------------------- |
| `"base"` | The component's tree container. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
