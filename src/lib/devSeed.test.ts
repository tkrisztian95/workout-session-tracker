import { beforeEach, describe, expect, it } from 'vitest';
import { clearDevSeed, resetToOnboarding, seedDevDataIfEmpty } from './devSeed';

beforeEach(() => {
  localStorage.clear();
});

describe('clearDevSeed', () => {
  it('removes seeded data and the seed flag', () => {
    localStorage.setItem('wst_plans', '[]');
    localStorage.setItem('wst_sessions', '[]');
    localStorage.setItem('wst_user_name', 'Tester');
    localStorage.setItem('wst_dev_seeded', '3');

    clearDevSeed();

    expect(localStorage.getItem('wst_plans')).toBeNull();
    expect(localStorage.getItem('wst_sessions')).toBeNull();
    expect(localStorage.getItem('wst_user_name')).toBeNull();
    expect(localStorage.getItem('wst_dev_seeded')).toBeNull();
  });
});

describe('resetToOnboarding', () => {
  it('wipes user data so onboarding shows again', () => {
    localStorage.setItem('wst_user_name', 'Tester');
    localStorage.setItem('wst_consent_accepted', 'true');
    localStorage.setItem('wst_plans', '[{"id":"p1"}]');

    resetToOnboarding();

    expect(localStorage.getItem('wst_user_name')).toBeNull();
    expect(localStorage.getItem('wst_consent_accepted')).toBeNull();
    expect(localStorage.getItem('wst_plans')).toBeNull();
  });

  it('marks the seed as applied so the next load does not re-seed', async () => {
    resetToOnboarding();
    await expect(seedDevDataIfEmpty()).resolves.toEqual({
      seeded: false,
      reason: 'already-seeded',
    });
  });
});
