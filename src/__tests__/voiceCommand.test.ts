import { describe, expect, it } from 'vitest';
import { parseVoiceNavigationCommand } from '../services/voiceCommandService';

describe('Voice-Guided Dashboard Navigation Command Parser', () => {
  it('routes English scam checker commands to /check', () => {
    expect(parseVoiceNavigationCommand('open scam checker')?.route).toBe('/check');
    expect(parseVoiceNavigationCommand('please check a message')?.route).toBe('/check');
    expect(parseVoiceNavigationCommand('verify suspicious sms')?.route).toBe('/check');
  });

  it('routes voice dictation commands to /check?voice=1 before generic check', () => {
    const match = parseVoiceNavigationCommand('speak message');
    expect(match?.intent).toBe('speak_message');
    expect(match?.route).toBe('/check?voice=1');

    expect(parseVoiceNavigationCommand('dictate message')?.route).toBe('/check?voice=1');
  });

  it('routes emergency and helpline commands to /emergency', () => {
    expect(parseVoiceNavigationCommand('emergency')?.route).toBe('/emergency');
    expect(parseVoiceNavigationCommand('call 1930 helpline')?.route).toBe('/emergency');
    expect(parseVoiceNavigationCommand('report cybercrime')?.route).toBe('/emergency');
    expect(parseVoiceNavigationCommand('police help')?.route).toBe('/emergency');
  });

  it('routes history commands to /history', () => {
    expect(parseVoiceNavigationCommand('show history')?.route).toBe('/history');
    expect(parseVoiceNavigationCommand('open past checks')?.route).toBe('/history');
    expect(parseVoiceNavigationCommand('recent records')?.route).toBe('/history');
  });

  it('routes Malayalam and Manglish spoken commands accurately', () => {
    expect(parseVoiceNavigationCommand('സന്ദേശം പരിശോധിക്കുക')?.route).toBe('/check');
    expect(parseVoiceNavigationCommand('അടിയന്തര സഹായം')?.route).toBe('/emergency');
    expect(parseVoiceNavigationCommand('ചരിത്രം കാണിക്കൂ')?.route).toBe('/history');
    expect(parseVoiceNavigationCommand('charithram')?.route).toBe('/history');
    expect(parseVoiceNavigationCommand('കുടുംബം')?.route).toBe('/family');
  });

  it('supports secondary helpful destinations (family, lessons, exposure, privacy)', () => {
    expect(parseVoiceNavigationCommand('open family')?.route).toBe('/family');
    expect(parseVoiceNavigationCommand('safety lessons')?.route).toBe('/lessons');
    expect(parseVoiceNavigationCommand('exposure overview')?.route).toBe('/exposure');
    expect(parseVoiceNavigationCommand('privacy dashboard')?.route).toBe('/privacy');
  });

  it('returns null for empty or unrecognized speech', () => {
    expect(parseVoiceNavigationCommand('')).toBeNull();
    expect(parseVoiceNavigationCommand('   ')).toBeNull();
    expect(parseVoiceNavigationCommand('good morning how is the weather')).toBeNull();
  });
});
