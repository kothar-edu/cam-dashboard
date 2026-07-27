export type SettingsSection = 'account' | 'app' | 'registration' | 'create-admin';

export type SettingsSectionDef = {
  id: SettingsSection;
  label: string;
  description: string;
};

const ALL_SECTIONS: Array<SettingsSectionDef & { requiresTenantManager?: boolean }> = [
  {
    id: 'app',
    label: 'App settings',
    description: 'Features, posts, sponsors & labels',
  },
  {
    id: 'registration',
    label: 'Registration settings',
    description: 'Bank details & fees',
  },
  {
    id: 'account',
    label: 'Account',
    description: 'Password & login',
  },
  {
    id: 'create-admin',
    label: 'Create admin',
    description: 'Invite staff users',
    requiresTenantManager: true,
  },
];

export const LEGACY_SECTION_ALIASES: Record<string, SettingsSection> = {
  password: 'account',
  'game-settings': 'app',
  game: 'app',
  'payment-settings': 'registration',
  payment: 'registration',
  'create-admin': 'create-admin',
};

export function buildSettingsSections(canManageTenants: boolean): SettingsSectionDef[] {
  return ALL_SECTIONS.filter(
    (section) => !section.requiresTenantManager || canManageTenants
  ).map(({ id, label, description }) => ({ id, label, description }));
}

export function resolveSettingsSection(
  requested: string | null,
  sections: SettingsSectionDef[]
): SettingsSection {
  const fallback = sections[0]?.id ?? 'app';
  const raw = requested ?? fallback;
  const normalized = LEGACY_SECTION_ALIASES[raw] ?? raw;
  if (sections.some((section) => section.id === normalized)) {
    return normalized as SettingsSection;
  }
  return fallback;
}
