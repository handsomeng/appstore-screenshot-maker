# Requirements Document

## Introduction

实现多画布模板同步功能，支持用户上传多张截图（3-4张），通过第一张图建立模板，后续画布可选择性同步模板修改，同时保留独立调整能力。

## Glossary

- **Canvas**: 单个画布，包含背景、截图、文字图层等元素
- **Master_Canvas**: 第一张画布，作为模板源，修改时可同步到其他画布
- **Slave_Canvas**: 第 2/3/4 张画布，可独立调整，修改不影响其他画布
- **Sync_Confirmation**: 同步确认对话框，在 Master_Canvas 修改时询问是否同步
- **Canvas_Switcher**: 画布切换器，用于在多个画布间切换
- **Syncable_Property**: 可同步的属性，包括背景、文字图层、截图位置等

## Requirements

### Requirement 1: 多画布管理

**User Story:** As a user, I want to manage multiple canvases (3-4), so that I can create a set of App Store screenshots efficiently.

#### Acceptance Criteria

1. THE Canvas_Switcher SHALL display all canvases as thumbnail previews in a horizontal strip
2. WHEN a user clicks on a canvas thumbnail, THE System SHALL switch to that canvas for editing
3. WHEN a user uploads a screenshot, THE System SHALL create a new canvas with that screenshot
4. THE System SHALL support a maximum of 6 canvases
5. WHEN a user deletes a canvas, THE System SHALL remove it and re-index remaining canvases
6. THE System SHALL visually distinguish the Master_Canvas (first canvas) from Slave_Canvases

### Requirement 2: 画布尺寸自由调整

**User Story:** As a user, I want to freely resize the canvas by dragging, so that I can customize the output dimensions without preset constraints.

#### Acceptance Criteria

1. THE System SHALL display resize handles on the canvas edges and corners
2. WHEN a user drags a resize handle, THE System SHALL update the canvas dimensions in real-time
3. THE System SHALL maintain a minimum canvas size of 200x200 pixels
4. THE System SHALL display the current canvas dimensions during resize
5. WHEN the canvas is resized on Master_Canvas, THE Sync_Confirmation SHALL ask if the size change should apply to other canvases

### Requirement 3: 模板同步机制 - 背景

**User Story:** As a user, I want background changes on the first canvas to optionally sync to other canvases, so that I can maintain visual consistency across all screenshots.

#### Acceptance Criteria

1. WHEN a user changes the background color on Master_Canvas, THE Sync_Confirmation SHALL appear asking "Apply this background to other canvases?"
2. IF the user confirms sync, THEN THE System SHALL apply the same background to all Slave_Canvases
3. IF the user declines sync, THEN THE System SHALL only apply the change to Master_Canvas
4. WHEN a user changes the background on a Slave_Canvas, THE System SHALL only apply the change to that canvas without confirmation
5. THE Sync_Confirmation SHALL include a "Remember my choice" checkbox to skip future confirmations

### Requirement 4: 模板同步机制 - 文字图层

**User Story:** As a user, I want text layer changes on the first canvas to optionally sync to other canvases, so that I can create consistent text layouts.

#### Acceptance Criteria

1. WHEN a user adds a text layer on Master_Canvas, THE Sync_Confirmation SHALL ask "Add this text to other canvases?"
2. IF the user confirms sync, THEN THE System SHALL create text layers on all Slave_Canvases with the same style (font, size, color, position) but with placeholder content
3. WHEN a user modifies text style (font, size, color, position) on Master_Canvas, THE Sync_Confirmation SHALL ask if the style change should sync
4. WHEN a user modifies text content on Master_Canvas, THE Sync_Confirmation SHALL ask if the change should sync
5. IF the user confirms text content sync, THEN THE System SHALL create placeholder text on Slave_Canvases matching the character count (e.g., 5 characters → "哈哈哈哈哈")
6. WHEN a user modifies any text property on a Slave_Canvas, THE System SHALL only apply the change to that canvas
7. WHEN a user deletes a text layer on Master_Canvas, THE Sync_Confirmation SHALL ask "Delete this text from other canvases?"

### Requirement 5: 模板同步机制 - 截图位置

**User Story:** As a user, I want screenshot position and scale changes on the first canvas to optionally sync to other canvases, so that all screenshots have consistent placement.

#### Acceptance Criteria

1. WHEN a user moves or scales the screenshot on Master_Canvas, THE Sync_Confirmation SHALL ask "Apply this position to other canvases?"
2. IF the user confirms sync, THEN THE System SHALL apply the same position and scale to screenshots on all Slave_Canvases
3. WHEN a user moves or scales the screenshot on a Slave_Canvas, THE System SHALL only apply the change to that canvas
4. THE System SHALL preserve relative positioning when syncing (percentage-based, not absolute pixels)

### Requirement 6: 同步确认交互优化

**User Story:** As a user, I want the sync confirmation to be non-intrusive, so that my workflow is not constantly interrupted.

#### Acceptance Criteria

1. THE Sync_Confirmation SHALL appear as a small toast-like popup near the edited element
2. THE Sync_Confirmation SHALL auto-dismiss after 5 seconds if no action is taken (defaulting to no sync)
3. THE System SHALL provide a "Batch Mode" toggle that auto-syncs all Master_Canvas changes without confirmation
4. WHEN Batch Mode is enabled, THE System SHALL display a persistent indicator showing sync is active
5. THE System SHALL allow users to undo synced changes on individual canvases

### Requirement 7: 画布状态持久化

**User Story:** As a user, I want my multi-canvas project to be saved, so that I can continue editing later.

#### Acceptance Criteria

1. THE System SHALL store all canvas states including backgrounds, text layers, and screenshot positions
2. THE System SHALL support exporting all canvases as separate image files in one action
3. WHEN exporting, THE System SHALL name files sequentially (screenshot_1.png, screenshot_2.png, etc.)
