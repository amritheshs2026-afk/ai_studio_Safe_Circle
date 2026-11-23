export interface CapabilityMatrixRow {
  featureEn: string;
  featureMl: string;
  pwaStatusEn: string;
  pwaStatusMl: string;
  androidStatusEn: string;
  androidStatusMl: string;
  availableInBrowser: boolean;
}

export interface PlatformCapabilities {
  isStandalonePWA: boolean;
  speechRecognitionSupported: boolean;
  speechSynthesisSupported: boolean;
  hasMalayalamVoice: boolean;
  clipboardReadSupported: boolean;
  storagePersistSupported: boolean;
  cameraSupported: boolean;
}

export function detectPlatformCapabilities(): PlatformCapabilities {
  const isBrowser = typeof window !== 'undefined';
  const isStandalonePWA =
    isBrowser &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  const win = isBrowser ? (window as unknown as Record<string, unknown>) : {};
  const speechRecognitionSupported = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  const speechSynthesisSupported = isBrowser && 'speechSynthesis' in window;

  let hasMalayalamVoice = false;
  if (speechSynthesisSupported) {
    try {
      const voices = window.speechSynthesis.getVoices();
      hasMalayalamVoice = voices.some((v) => v.lang.toLowerCase().startsWith('ml'));
    } catch {
      hasMalayalamVoice = false;
    }
  }

  const clipboardReadSupported = Boolean(
    isBrowser && navigator.clipboard && typeof navigator.clipboard.readText === 'function',
  );
  const storagePersistSupported = Boolean(
    isBrowser && navigator.storage && typeof navigator.storage.persist === 'function',
  );
  const cameraSupported = Boolean(
    isBrowser && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function',
  );

  return {
    isStandalonePWA,
    speechRecognitionSupported,
    speechSynthesisSupported,
    hasMalayalamVoice,
    clipboardReadSupported,
    storagePersistSupported,
    cameraSupported,
  };
}

export const CAPABILITY_MATRIX: CapabilityMatrixRow[] = [
  {
    featureEn: 'Offline message & link checking (English + Malayalam)',
    featureMl: 'ഓഫ്‌ലൈൻ സന്ദേശവും ലിങ്കും പരിശോധന',
    pwaStatusEn: 'Available now',
    pwaStatusMl: 'ഇപ്പോൾ ലഭ്യമാണ്',
    androidStatusEn: 'Available',
    androidStatusMl: 'ലഭ്യമാണ്',
    availableInBrowser: true,
  },
  {
    featureEn: 'Local history, exposure overview & safety lessons',
    featureMl: 'സുരക്ഷാ ചരിത്രം, അവലോകനം & പാഠങ്ങൾ',
    pwaStatusEn: 'Available now',
    pwaStatusMl: 'ഇപ്പോൾ ലഭ്യമാണ്',
    androidStatusEn: 'Available',
    androidStatusMl: 'ലഭ്യമാണ്',
    availableInBrowser: true,
  },
  {
    featureEn: 'Family guardian linking & real-time alerts',
    featureMl: 'കുടുംബ ഗാർഡിയൻ ബന്ധവും മുന്നറിയിപ്പുകളും',
    pwaStatusEn: 'Available (with sign-in)',
    pwaStatusMl: 'ലഭ്യമാണ് (സൈൻ ഇൻ വഴി)',
    androidStatusEn: 'Available',
    androidStatusMl: 'ലഭ്യമാണ്',
    availableInBrowser: true,
  },
  {
    featureEn: 'Share message from other apps',
    featureMl: 'മറ്റു ആപ്പുകളിൽ നിന്ന് സന്ദേശം പങ്കുവയ്ക്കൽ',
    pwaStatusEn: 'Installed Android PWA only (not iOS)',
    pwaStatusMl: 'ഇൻസ്റ്റാൾ ചെയ്ത Android PWA-യിൽ മാത്രം',
    androidStatusEn: 'Full native Share Sheet',
    androidStatusMl: 'പൂർണ്ണ Share Sheet സൗകര്യം',
    availableInBrowser: true,
  },
  {
    featureEn: 'Push-to-talk voice dictation & Read Aloud',
    featureMl: 'വോയ്സ് ടൈപ്പിംഗും ഉറക്കെ വായനയും',
    pwaStatusEn: 'Depends on browser & device voices',
    pwaStatusMl: 'ബ്രൗസറും ഫോൺ ശബ്ദവും അനുസരിച്ച്',
    androidStatusEn: 'Native Speech & TTS',
    androidStatusMl: 'നേറ്റീവ് സ്പീച്ച് & TTS',
    availableInBrowser: true,
  },
  {
    featureEn: 'Floating safety bubble over other apps',
    featureMl: 'മറ്റു ആപ്പുകൾക്ക് മുകളിലുള്ള ഫ്ലോട്ടിംഗ് ബബിൾ',
    pwaStatusEn: 'Not available in web browsers (Android app feature)',
    pwaStatusMl: 'വെബ് ബ്രൗസറിൽ ലഭ്യമല്ല (Android ആപ്പ് സൗകര്യം)',
    androidStatusEn: 'Optional (opt-in overlay)',
    androidStatusMl: 'ഓപ്ഷണൽ സൗകര്യം',
    availableInBrowser: false,
  },
  {
    featureEn: 'Opt-in notification screening & background service',
    featureMl: 'നോട്ടിഫിക്കേഷൻ പരിശോധനയും ബാക്ക്‌ഗ്രൗണ്ട് സേവനവും',
    pwaStatusEn: 'Not available in web browsers (Simulated demo included)',
    pwaStatusMl: 'വെബ് ബ്രൗസറിൽ ലഭ്യമല്ല (മാതൃകാ ഡെമോ ഉണ്ട്)',
    androidStatusEn: 'Optional (opt-in)',
    androidStatusMl: 'ഓപ്ഷണൽ സൗകര്യം',
    availableInBrowser: false,
  },
];
