/**
 * Tier 40 — polish + design system micro-improvements.
 *
 * This barrel re-exports the v2 generation of small primitives that
 * standardise patterns already used ad-hoc across the app (panel
 * kandydata-dłużnika v2, marketing v2, admin operacje masowe).
 *
 * Keep imports tree-shake friendly — do NOT add side-effect modules here.
 */

export { Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps } from "./breadcrumbs";
export { Pagination, type PaginationProps } from "./pagination";
export { CopyButton, type CopyButtonProps } from "./copy-button";
export {
  MultiSelect,
  type MultiSelectProps,
  type MultiSelectOption,
} from "./multi-select";
export { DatePicker, type DatePickerProps } from "./datepicker";
export { FileUploader, type FileUploaderProps } from "./file-uploader";
export { CommandPalette, type CommandItem } from "./command-palette";
export { ErrorState, type ErrorStateProps } from "./error-state";
export { LoadingState, SkeletonRow, SkeletonCard } from "./loading-state";
export { KeyboardShortcutsOverlay } from "./keyboard-shortcuts";
export {
  OnboardingTooltip,
  type OnboardingTooltipProps,
} from "./onboarding-tooltip";
export {
  AdvancedFilters,
  type AdvancedFiltersProps,
  type FilterDef,
} from "./advanced-filters";
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentOption,
} from "./segmented-control";
export { Stepper, type StepperProps, type StepperStep } from "./stepper";
export {
  InlineBanner,
  type InlineBannerProps,
  type BannerTone,
} from "./inline-banner";
export { PageHeader, type PageHeaderProps } from "./page-header";
