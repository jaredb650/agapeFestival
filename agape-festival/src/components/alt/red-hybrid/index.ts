// ÄGAPĒ "red hybrid" alternate kit: the blue HUD build's cyber frames and chrome
// (winter-redesign @ c9688b5, before e88ce36 simplified it), re-tokened for the
// red-hybrid palette. Opt-in: render pieces inside <RedHybridKit>. See README.md.
export { RedHybridKit, type RedHybridKitProps } from "./RedHybridKit";

// Frames and bezels
export { Frame, type FrameProps } from "./Frame";
export { HudBezel, type HudBezelProps } from "./HudBezel";
export { PortBezel, type PortBezelProps } from "./PortBezel";
export { RailBezel, type RailBezelProps } from "./RailBezel";
export { TerminalFrame, type TerminalFrameProps } from "./TerminalFrame";
export { TargetingHud, HudRec, type TargetingHudProps, type HudRow } from "./TargetingHud";
export { HudBar, HudBarBrand, HudBarStatus, SignalBars, type HudBarProps, type HudBarLink } from "./HudBar";
export { MechWindow, type MechWindowProps } from "./MechWindow";
export { SectorPlate, type SectorPlateProps } from "./SectorPlate";
export { TickRail, type TickRailProps } from "./TickRail";

// Chrome and glass
export { GlassWindow, type GlassWindowProps } from "./GlassWindow";
export { ChromePlate, type ChromePlateProps } from "./ChromePlate";
export { ChromeKey, type ChromeKeyProps } from "./ChromeKey";
export { ChromeSocket, type ChromeSocketProps } from "./ChromeSocket";
export { ChromeHousing, type ChromeHousingProps } from "./ChromeHousing";
export { ChromeNotch, type ChromeNotchProps } from "./ChromeNotch";
export { Orb, type OrbProps } from "./Orb";
export { Lcd, type LcdProps } from "./Lcd";
export { SegmentLcd, type SegmentLcdProps, type SegmentGroup } from "./SegmentLcd";

// Hologram controls and HUD bits
export { HoloButton, type HoloButtonProps, type HoloButtonVariant, type HoloButtonSize } from "./HoloButton";
export { HoloKey, type HoloKeyProps } from "./HoloKey";
export { HudChip, type HudChipProps } from "./HudChip";
export { CtaRig, type CtaRigProps } from "./CtaRig";
export { HudLabel, type HudLabelProps } from "./HudLabel";
export { Grain, type GrainProps } from "./Grain";

// Helpers
export { decode, armEntrance, parkOffscreen, prefersReducedMotion } from "./fx";
export { useMeasure } from "./useMeasure";
export { cx } from "./cx";
