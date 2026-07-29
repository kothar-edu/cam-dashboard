import { describe, expect, it } from 'vitest';
import { buildSettingsSections } from '@/lib/settingsNav';

describe('buildSettingsSections', () => {
  it('hides account and create-admin while those flags are off', () => {
    expect(buildSettingsSections(true).map((s) => s.id)).toEqual([
      'app',
      'registration',
      'tenants',
    ]);
    expect(buildSettingsSections(false).map((s) => s.id)).toEqual(['app', 'registration']);
  });
});
