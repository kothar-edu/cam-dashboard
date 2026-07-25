export const ROUND_CHOICES = [
  'Group Stage',
  'Round of 16',
  'Quarter Final',
  'Semi Final',
  'Final',
  'Third Place',
  'Custom',
] as const;

export type RoundChoice = (typeof ROUND_CHOICES)[number];
