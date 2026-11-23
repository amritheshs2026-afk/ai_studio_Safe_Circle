import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE_PREFS, type LocalProfilePrefs } from '../services/incidentStore';
import {
  buildSmsHref,
  buildSosMessageText,
  cleanPhoneDigits,
  getPresetEmergencyContacts,
} from '../services/sosService';

describe('SOS Emergency Contact Helpers', () => {
  it('merges primary family contact and extra emergency contacts without duplicates', () => {
    const prefs: LocalProfilePrefs = {
      ...DEFAULT_PROFILE_PREFS,
      familyContactName: 'Meera',
      familyContactPhone: '+91 98765 43210',
      emergencyContacts: [
        { id: 'c1', name: 'Meera Duplicate', phone: '+919876543210', relation: 'Daughter' },
        { id: 'c2', name: 'Arjun', phone: '9847011223', relation: 'Son' },
        { id: 'c3', name: 'Empty', phone: '   ' },
      ],
    };

    const contacts = getPresetEmergencyContacts(prefs);
    expect(contacts).toHaveLength(2);
    expect(contacts[0].name).toBe('Meera');
    expect(contacts[1].name).toBe('Arjun');
    expect(contacts[1].relation).toBe('Son');
  });

  it('builds bilingual SOS alert copy cleanly in English and Malayalam', () => {
    const en = buildSosMessageText({ senderName: 'Amma', lang: 'en' });
    expect(en).toContain('SOS from Amma');
    expect(en).toContain('SafeCircle');

    const ml = buildSosMessageText({ senderName: 'അമ്മ', lang: 'ml' });
    expect(ml).toContain('അമ്മ');
    expect(ml).toContain('SOS');
  });

  it('formats multi-recipient SMS URI safely and returns null when empty', () => {
    expect(buildSmsHref([], 'Help')).toBeNull();
    expect(buildSmsHref(['   '], 'Help')).toBeNull();

    const href = buildSmsHref(['+91 98765 43210', '98470-11223'], 'SOS Help');
    expect(href).toBe('sms:+919876543210,9847011223?body=SOS%20Help');
    expect(cleanPhoneDigits('+91 (987) 654-3210')).toBe('+919876543210');
  });
});
