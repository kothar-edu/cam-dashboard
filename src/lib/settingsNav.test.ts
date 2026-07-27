import { describe, expect, it } from 'vitest';
import { buildSettingsSections } from '@/lib/settingsNav';

describe('buildSettingsSections', () => {
  it('includes create admin only for tenant managers', () => {
    expect(buildSettingsSections(true).map((s) => s.id)).toEqual([
      'account',
      'app',
      'registration',
      'create-admin',
    ]);
    expect(buildSettingsSections(false).map((s) => s.id)).toEqual([
      'account',
      'app',
      'registration',
    ]);
  });
});
