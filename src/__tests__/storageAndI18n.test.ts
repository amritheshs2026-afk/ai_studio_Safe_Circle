import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TRANSLATIONS } from '../localization/dictionary';
import { SAFETY_LESSONS } from '../data/lessons';
import { scanService } from '../services/scanService';
import { incidentStore } from '../services/incidentStore';
import { hashPin, isValidPinFormat, verifyPin } from '../services/pinService';

const BANNED_BLAME_PHRASES = [
  'careless',
  'gullible',
  'stupid',
  'vulnerable person',
  'failed',
  'foolish',
  'at fault',
  'negligent',
];

describe('SafeCircle Storage, PIN Privacy & i18n Integrity', () => {
  it('stores ONLY non-text Incident records in IndexedDB (never >3-word message substrings)', async () => {
    await incidentStore.deleteAllIncidents();
    const rawMessage =
      'CBI Mumbai cyber desk calls victim Anitha Menon regarding parcel seizure demanding Rs 72500 transfer immediately.';

    const { incident, result } = await scanService.scanAndRecord({
      text: rawMessage,
      source: 'manual',
      language: 'en',
    });

    expect(result.verdict).toBe('DANGEROUS');

    const allStored = await incidentStore.listIncidents();
    expect(allStored.length).toBe(1);
    expect(allStored[0].id).toBe(incident.id);

    const serializedDb = JSON.stringify(allStored).toLowerCase();
    const words = rawMessage.toLowerCase().split(/\s+/);
    for (let i = 0; i <= words.length - 4; i += 1) {
      const sub = words.slice(i, i + 4).join(' ');
      expect(serializedDb).not.toContain(sub);
    }
    expect(serializedDb).not.toContain('anitha');
    expect(serializedDb).not.toContain('72500');
  });

  it('hashes and verifies 4-6 digit PINs using salted PBKDF2', async () => {
    expect(isValidPinFormat('1234')).toBe(true);
    expect(isValidPinFormat('123456')).toBe(true);
    expect(isValidPinFormat('123')).toBe(false);
    expect(isValidPinFormat('abcd')).toBe(false);

    const { hash, salt } = await hashPin('4829');
    expect(hash).not.toContain('4829');
    expect(await verifyPin('4829', hash, salt)).toBe(true);
    expect(await verifyPin('9999', hash, salt)).toBe(false);
  });

  it('maintains 100% key parity between English and Malayalam dictionaries with zero empty strings', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const mlKeys = Object.keys(TRANSLATIONS.ml).sort();
    expect(mlKeys).toEqual(enKeys);

    for (const key of enKeys) {
      const enVal = TRANSLATIONS.en[key as keyof typeof TRANSLATIONS.en];
      const mlVal = TRANSLATIONS.ml[key as keyof typeof TRANSLATIONS.ml];
      if (Array.isArray(enVal)) {
        expect(Array.isArray(mlVal)).toBe(true);
        expect(enVal.length).toBeGreaterThan(0);
        expect((mlVal as string[]).length).toBe(enVal.length);
      } else {
        expect(String(enVal).trim().length).toBeGreaterThan(0);
        expect(String(mlVal).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('never uses blaming, shaming, or stigmatising language in UI copy, lessons, or rule templates', () => {
    const rulePackRaw = readFileSync(
      resolve(process.cwd(), 'src/engine/rulepacks/in-v1.json'),
      'utf8',
    );
    const packObj = JSON.parse(rulePackRaw) as { templates: Record<string, unknown> };

    const combinedCorpus = [
      JSON.stringify(TRANSLATIONS),
      JSON.stringify(SAFETY_LESSONS),
      JSON.stringify(packObj.templates),
    ]
      .join(' ')
      .toLowerCase();

    for (const banned of BANNED_BLAME_PHRASES) {
      expect(combinedCorpus).not.toContain(banned);
    }
  });
});
