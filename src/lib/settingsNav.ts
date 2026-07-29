export type SettingsSection = 'account' | 'app' | 'registration' | 'tenants' | 'create-admin';

export type SettingsSectionDef = {
  id: SettingsSection;
  label: string;
  description: string;
};

/** Flip to true to restore Account / Create admin in the settings nav. */
export const SHOW_ACCOUNT_SETTINGS = false;
export const SHOW_CREATE_ADMIN_SETTINGS = false;

const ALL_SECTIONS: Array<
  SettingsSectionDef & {
    requiresTenantManager?: boolean;
    visible?: boolean;
  }
> = [
  {
    id: 'app',
    label: 'App settings',
    description: 'Feature toggles for the mobile app',
  },
  {
    id: 'registration',
    label: 'Registration settings',
    description: 'Bank details & fees',
  },
  {
    id: 'tenants',
    label: 'Orgs',
    description: 'Organizations & admins',
    requiresTenantManager: true,
  },
  {
    id: 'account',
    label: 'Account',
    description: 'Password & login',
    visible: SHOW_ACCOUNT_SETTINGS,
  },
  {
    id: 'create-admin',
    label: 'Create admin',
    description: 'Invite staff users',
    requiresTenantManager: true,
    visible: SHOW_CREATE_ADMIN_SETTINGS,
  },
];

export const LEGACY_SECTION_ALIASES: Record<string, SettingsSection> = {
  password: 'account',
  'game-settings': 'app',
  game: 'app',
  'payment-settings': 'registration',
  payment: 'registration',
  tenants: 'tenants',
  organizations: 'tenants',
  'create-admin': 'create-admin',
};

export function buildSettingsSections(canManageTenants: boolean): SettingsSectionDef[] {
  return ALL_SECTIONS.filter(
    (section) =>
      (section.visible ?? true) && (!section.requiresTenantManager || canManageTenants)
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
