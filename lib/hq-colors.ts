// Centralized HQ text color tokens
// All values chosen for readability on dark navy (#060E1A) at low OLED brightness.
// Warm undertones prevent the cold blue-gray washout of the previous palette.

export const HQ_TEXT = {
  primary:   "rgba(242, 236, 218, 0.95)", // near-white warm — headings, metric values
  secondary: "rgba(215, 205, 182, 0.92)", // warm cream — important secondary text
  muted:     "rgba(192, 182, 158, 0.84)", // warm gray — descriptions, section labels
  helper:    "rgba(168, 158, 132, 0.74)", // subtle helper — timestamps, fine print
  disabled:  "rgba(145, 135, 112, 0.52)", // inactive/unavailable states
} as const;

export const HQ_GOLD = {
  bright:  "rgba(232, 186, 76, 0.96)",  // active nav, active badges — text-safe bright gold
  text:    "rgba(215, 168, 58, 0.92)",  // gold for standard text use
  dim:     "rgba(200, 152, 42, 0.80)",  // dimmed gold — still legible at low brightness
  bgTint:  "rgba(200, 150, 42, 0.12)", // gold background tint
  border:  "rgba(200, 150, 42, 0.28)", // gold border
} as const;

// Convenience bundles for nav states
export const HQ_NAV = {
  activeText:   HQ_GOLD.bright,
  activeIcon:   HQ_GOLD.text,
  inactiveText: HQ_TEXT.muted,
  inactiveIcon: HQ_TEXT.helper,
} as const;

// Card anatomy
export const HQ_CARD = {
  sectionLabel: HQ_TEXT.muted,  // UPPERCASE tracking labels on glass cards
  bodyText:     HQ_TEXT.secondary,
  helperText:   HQ_TEXT.helper,
} as const;
