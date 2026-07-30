import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  KeyRound,
  Settings2,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/forms/PageHeader';
import { ChangePasswordPanel, CreateAdminPanel } from '@/components/settings/AccountSettingsPanels';
import { AppSettingsPanel, SettingsCard } from '@/components/settings/AppSettingsPanel';
import { RegistrationSettingsPanel } from '@/components/settings/RegistrationSettingsPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import {
  buildSettingsSections,
  resolveSettingsSection,
  type SettingsSection,
} from '@/lib/settingsNav';
import { cn } from '@/lib/utils';
import TenantsPage from '@/pages/TenantsPage';

const SECTION_ICONS: Record<SettingsSection, LucideIcon> = {
  account: KeyRound,
  app: Settings2,
  registration: CreditCard,
  tenants: Building2,
  'create-admin': UserPlus,
};

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { canManageTenants } = useAuth();
  const { activeTenant } = useTenant();

  const sections = useMemo(() => buildSettingsSections(canManageTenants), [canManageTenants]);

  const activeSection = resolveSettingsSection(searchParams.get('section'), sections);

  const setSection = (section: SettingsSection) => {
    if (section === 'app') {
      setSearchParams({ section, tab: 'features' }, { replace: true });
      return;
    }
    setSearchParams({ section }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={
          activeTenant
            ? `${activeTenant.name} · account and organization configuration`
            : 'Account and organization configuration'
        }
      />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.id];
            const active = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSection(section.id)}
                className={cn(
                  'flex min-w-[11rem] shrink-0 items-start gap-3 rounded-xl border px-3 py-3 text-left transition lg:min-w-0 lg:w-full',
                  active
                    ? 'border-[#E8A93B]/50 bg-[#12233D] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-[#12233D] hover:border-[#E8A93B]/40'
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#E8A93B]" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{section.label}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-[11px] leading-snug',
                      active ? 'text-white/70' : 'text-muted-foreground'
                    )}
                  >
                    {section.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <SettingsCard>
          <SectionContent section={activeSection} />
        </SettingsCard>
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: SettingsSection }) {
  switch (section) {
    case 'app':
      return <AppSettingsPanel />;
    case 'registration':
      return <RegistrationSettingsPanel />;
    case 'tenants':
      return <TenantsPage embedded />;
    case 'create-admin':
      return <CreateAdminPanel />;
    case 'account':
    default:
      return <ChangePasswordPanel />;
  }
}
