import type { Language } from '../engine/types';
import type { EmergencyContact, LocalProfilePrefs } from './incidentStore';

export function cleanPhoneDigits(phone: string): string {
  return phone.replace(/[^\d+]/g, '').trim();
}

/**
 * Merges the primary family quick-call contact and additional pre-set emergency contacts,
 * deduplicating by normalized phone number while keeping primary contact first.
 */
export function getPresetEmergencyContacts(prefs: LocalProfilePrefs): EmergencyContact[] {
  const seenPhones = new Set<string>();
  const result: EmergencyContact[] = [];

  const primaryPhone = prefs.familyContactPhone.trim();
  const primaryNorm = cleanPhoneDigits(primaryPhone);
  if (primaryNorm.length >= 3) {
    seenPhones.add(primaryNorm);
    result.push({
      id: 'primary_family',
      name: prefs.familyContactName.trim() || (prefs.language === 'ml' ? 'കുടുംബാംഗം' : 'Family Contact'),
      phone: primaryPhone,
      relation: prefs.language === 'ml' ? 'പ്രധാന നമ്പർ' : 'Primary contact',
    });
  }

  for (const contact of prefs.emergencyContacts ?? []) {
    const rawPhone = contact.phone.trim();
    const norm = cleanPhoneDigits(rawPhone);
    if (norm.length < 3 || seenPhones.has(norm)) continue;
    seenPhones.add(norm);
    result.push({
      id: contact.id,
      name: contact.name.trim() || (prefs.language === 'ml' ? 'കുടുംബാംഗം' : 'Emergency Contact'),
      phone: rawPhone,
      relation: contact.relation?.trim() || undefined,
    });
  }

  return result;
}

export function buildSosMessageText(params: { senderName: string; lang: Language }): string {
  const name = params.senderName.trim() || (params.lang === 'ml' ? 'നിങ്ങളുടെ കുടുംബാംഗം' : 'A family member');
  if (params.lang === 'ml') {
    return `${name} അയക്കുന്ന അടിയന്തര SOS (SafeCircle): സംശയാസ്പദമായ തട്ടിപ്പോ അടിയന്തര സാഹചര്യമോ ഉണ്ട്, ഉടൻ സഹായം വേണം. ദയവായി ഇപ്പോൾ തന്നെ വിളിക്കൂ.`;
  }
  return `SOS from ${name} (SafeCircle): I may be facing a suspected scam or urgent situation and need your help right now. Please call me immediately.`;
}

export function buildSmsHref(phones: string[], body: string): string | null {
  const cleaned = phones.map(cleanPhoneDigits).filter((p) => p.length >= 3);
  if (cleaned.length === 0) return null;
  return `sms:${cleaned.join(',')}?body=${encodeURIComponent(body)}`;
}

export function triggerSmsComposer(phones: string[], body: string): boolean {
  const href = buildSmsHref(phones, body);
  if (!href || typeof document === 'undefined') return false;
  const link = document.createElement('a');
  link.href = href;
  link.click();
  return true;
}
