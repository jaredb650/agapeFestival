// The classic kit (classic-refined restyle, Nov 2026). Guide: context/winter-redesign/classic-brief.md.
// Styles: src/styles/classic.css (shell, type) and src/styles/kit/buttons.css (every control), both
// imported by page.tsx after the base kit.
export { Section, StageHeading, type SectionProps, type StageHeadingProps } from "./Section";
export { RevealObserver } from "./RevealObserver";
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize, type ButtonIcon } from "./Button";
export { IconButton, CloseButton, type IconButtonProps, type IconButtonVariant, type IconButtonSize } from "./IconButton";
export { Segmented, type SegmentedProps, type SegmentedOption } from "./Segmented";
export { TabRail, tabId, panelId, type TabRailProps, type TabRailItem } from "./TabRail";
