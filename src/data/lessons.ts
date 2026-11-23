export interface SafetyLesson {
  id: string;
  titleEn: string;
  titleMl: string;
  summaryEn: string;
  summaryMl: string;
  pointsEn: string[];
  pointsMl: string[];
  takeawayEn: string;
  takeawayMl: string;
  needsNativeReview: boolean;
}

export const SAFETY_LESSONS: SafetyLesson[] = [
  {
    id: 'lesson-digital-arrest',
    titleEn: '1. "Digital Arrest" Does Not Exist',
    titleMl: '1. "ഡിജിറ്റൽ അറസ്റ്റ്" എന്നൊന്നില്ല',
    summaryEn: 'Real police or CBI never arrest anyone over a phone or video call.',
    summaryMl: 'യഥാർത്ഥ പോലീസോ സിബിഐയോ ഒരിക്കലും വീഡിയോ കോളിലൂടെ അറസ്റ്റ് ചെയ്യില്ല.',
    pointsEn: [
      'Scammers wear fake uniforms on video calls to create fear.',
      'They tell you not to disconnect and not to tell your family.',
      'Real officers never ask you to transfer money to a "safe account".',
    ],
    pointsMl: [
      'തട്ടിപ്പുകാർ ഭയപ്പെടുത്താൻ വ്യാജ യൂണിഫോം ധരിച്ച് വീഡിയോ കോൾ ചെയ്യാറുണ്ട്.',
      'ഫോൺ കട്ട് ചെയ്യരുതെന്നും വീട്ടുകാരോട് പറയരുതെന്നും അവർ പറയും.',
      'യഥാർത്ഥ പോലീസ് ഒരിക്കലും "സേഫ് അക്കൗണ്ടിലേക്ക്" പണം അയക്കാൻ പറയില്ല.',
    ],
    takeawayEn: 'Hang up calmly and call your family immediately.',
    takeawayMl: 'ശാന്തമായി കോൾ കട്ട് ചെയ്ത് ഉടൻ കുടുംബത്തെ വിളിക്കുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-otp-pin',
    titleEn: '2. Your OTP and PIN Are Like House Keys',
    titleMl: '2. ഒടിപിയും പിന്നും വീടിന്റെ താക്കോൽ പോലെയാണ്',
    summaryEn: 'Banks send OTPs for you to use, never to read aloud to a caller.',
    summaryMl: 'ബാങ്ക് ഒടിപി അയക്കുന്നത് നിങ്ങൾ ഉപയോഗിക്കാനാണ്, മറ്റുള്ളവരോട് പറയാനല്ല.',
    pointsEn: [
      'A message showing your OTP is normal if YOU started a payment.',
      'Anyone calling or texting to ask for your OTP or PIN is trying to take money.',
      'Real bank staff never ask for OTP, CVV, ATM PIN, or net-banking passwords.',
    ],
    pointsMl: [
      'നിങ്ങൾ ഒരു ഇടപാട് തുടങ്ങുമ്പോൾ ഒടിപി വരുന്നത് സാധാരണമാണ്.',
      'ആരെങ്കിലും ഒടിപിയോ പിൻ നമ്പറോ ചോദിച്ചാൽ അത് തട്ടിപ്പാണ്.',
      'ബാങ്ക് ജീവനക്കാർ ഒരിക്കലും ഒടിപിയോ സിവിവിയോ പിൻ നമ്പറോ ചോദിക്കില്ല.',
    ],
    takeawayEn: 'Never share OTP, PIN, or CVV with anyone—even if they sound polite.',
    takeawayMl: 'ഒടിപിയും പിൻ നമ്പറും ഒരിക്കലും ആരോടും പങ്കുവയ്ക്കരുത്.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-fake-kyc',
    titleEn: '3. Fake KYC & Disconnection Threats',
    titleMl: '3. വ്യാജ കെവൈസി & കണക്ഷൻ കട്ട് ഭീഷണികൾ',
    summaryEn: 'Messages saying your bank account, SIM, or electricity ends tonight are usually traps.',
    summaryMl: 'അക്കൗണ്ടോ സിമ്മോ വൈദ്യുതിയോ ഇന്ന് രാത്രി കട്ടാകും എന്ന സന്ദേശങ്ങൾ മിക്കതും തട്ടിപ്പാണ്.',
    pointsEn: [
      'Scammers send links like sbi-kyc-update.xyz or kseb-pay.top.',
      'Real banks and KSEB use their official websites or let you visit the office.',
      'Never tap a link inside an urgent warning SMS.',
    ],
    pointsMl: [
      'വ്യാജ ലിങ്കുകൾ വഴി വിവരങ്ങൾ മോഷ്ടിക്കാനാണ് അവർ ശ്രമിക്കുന്നത്.',
      'യഥാർത്ഥ ബാങ്കുകളോ കെഎസ്ഇബിയോ ഔദ്യോഗിക വെബ്‌സൈറ്റോ ഓഫീസോ ഉപയോഗിക്കുന്നു.',
      'ഭയപ്പെടുത്തുന്ന എസ്എംഎസ് ലിങ്കുകളിൽ ഒരിക്കലും തൊടരുത്.',
    ],
    takeawayEn: 'Visit your bank or check the official app directly.',
    takeawayMl: 'നേരിട്ട് ബാങ്കിലോ ഔദ്യോഗിക ആപ്പിലോ പരിശോധിക്കുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-remote-apps',
    titleEn: '4. Never Install Screen-Sharing Apps for Strangers',
    titleMl: '4. അപരിചിതർ പറയുമ്പോൾ സ്ക്രീൻ ഷെയറിംഗ് ആപ്പുകൾ ഇൻസ്റ്റാൾ ചെയ്യരുത്',
    summaryEn: 'Apps like AnyDesk or TeamViewer let a stranger see everything on your phone.',
    summaryMl: 'AnyDesk പോലുള്ള ആപ്പുകൾ വഴി അപരിചിതർക്ക് നിങ്ങളുടെ ഫോൺ നിയന്ത്രിക്കാൻ കഴിയും.',
    pointsEn: [
      'If someone sees your screen, they can read your SMS OTPs and open your bank apps.',
      'No customer care, courier, or bank officer needs screen access to send a refund.',
    ],
    pointsMl: [
      'നിങ്ങളുടെ സ്ക്രീൻ കാണുന്നതിലൂടെ അവർക്ക് ഒടിപിയും ബാങ്ക് ആപ്പുകളും കാണാനാകും.',
      'റീഫണ്ട് നൽകാൻ ഒരു ബാങ്കിനും സ്ക്രീൻ ഷെയറിംഗ് ആവശ്യമില്ല.',
    ],
    takeawayEn: 'Refuse any request to install AnyDesk, TeamViewer, or QuickSupport.',
    takeawayMl: 'സ്ക്രീൻ ഷെയറിംഗ് ആപ്പുകൾ ഇൻസ്റ്റാൾ ചെയ്യാൻ ആവശ്യപ്പെട്ടാൽ നിരസിക്കുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-apk-files',
    titleEn: '5. Do Not Install ".apk" Files from WhatsApp',
    titleMl: '5. WhatsApp വഴി വരുന്ന ".apk" ഫയലുകൾ ഇൻസ്റ്റാൾ ചെയ്യരുത്',
    summaryEn: 'Wedding invites, RTO challan, or PM Kisan ".apk" files can install harmful apps.',
    summaryMl: 'വിവാഹ ക്ഷണക്കത്തോ ആർടിഒ ചലാനോ എന്ന പേരിൽ വരുന്ന ".apk" ഫയലുകൾ അപകടകരമാണ്.',
    pointsEn: [
      'Real invitations are photos or PDFs, never ".apk" files.',
      'Only install apps from the official Google Play Store.',
    ],
    pointsMl: [
      'യഥാർത്ഥ ക്ഷണക്കത്തുകൾ ഫോട്ടോയോ പിഡിഎഫോ ആയിരിക്കും, ".apk" അല്ല.',
      'ഔദ്യോഗിക Play Store-ൽ നിന്ന് മാത്രം ആപ്പുകൾ ഇൻസ്റ്റാൾ ചെയ്യുക.',
    ],
    takeawayEn: 'If a file name ends in .apk, delete it without opening.',
    takeawayMl: 'ഫയലിന്റെ അവസാനം .apk എന്നാണെങ്കിൽ തുറക്കാതെ ഡിലീറ്റ് ചെയ്യുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-upi-qr',
    titleEn: '6. You Never Enter Your UPI PIN to RECEIVE Money',
    titleMl: '6. പണം ലഭിക്കാൻ ഒരിക്കലും യുപിഐ പിൻ നൽകേണ്ടതില്ല',
    summaryEn: 'Entering your UPI PIN or scanning a QR code always SENDS money out.',
    summaryMl: 'യുപിഐ പിൻ നൽകുന്നതും ക്യുആർ സ്കാൻ ചെയ്യുന്നതും പണം അയക്കാനാണ്, കിട്ടാനല്ല.',
    pointsEn: [
      'Buyers on marketplace apps sometimes send a QR code claiming it is for your payment.',
      'If an app asks for your PIN, money is leaving your account.',
    ],
    pointsMl: [
      'പണം തരാനാണെന്ന് പറഞ്ഞ് ക്യുആർ കോഡ് അയച്ചു തരുന്നത് തട്ടിപ്പാണ്.',
      'പിൻ ചോദിക്കുന്നുണ്ടെങ്കിൽ നിങ്ങളുടെ അക്കൗണ്ടിൽ നിന്ന് പണം പോകുകയാണ്.',
    ],
    takeawayEn: 'Decline unexpected UPI "Collect" requests immediately.',
    takeawayMl: 'അപരിചിതമായ യുപിഐ റിക്വസ്റ്റുകൾ ഉടൻ നിരസിക്കുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-relative-scam',
    titleEn: '7. Verify "New Number" Relative Emergencies',
    titleMl: '7. "പുതിയ നമ്പർ" ബന്ധുക്കളുടെ അത്യാവശ്യ കോളുകൾ ഉറപ്പുവരുത്തുക',
    summaryEn: 'If someone messages as your child or grandchild needing urgent money, call their old number.',
    summaryMl: 'മകനോ പേരക്കുട്ടിയോ ആണെന്ന് പറഞ്ഞ് പുതിയ നമ്പറിൽ നിന്ന് പണം ചോദിച്ചാൽ പഴയ നമ്പറിൽ വിളിക്കുക.',
    pointsEn: [
      'Scammers may say "lost my phone", "hospital", or "don\'t tell Dad".',
      'Always call the saved number you already know to check.',
    ],
    pointsMl: [
      '"ഫോൺ നഷ്ടപ്പെട്ടു", "ആശുപത്രിയിലാണ്", "അച്ഛനോട് പറയരുത്" എന്നൊക്കെ അവർ പറയാം.',
      'എപ്പോഴും നിങ്ങളുടെ ഫോണിൽ സേവ് ചെയ്ത പഴയ നമ്പറിൽ വിളിച്ച് ഉറപ്പുവരുത്തുക.',
    ],
    takeawayEn: 'Verify on a known phone number before sending any money.',
    takeawayMl: 'പണം അയക്കുന്നതിന് മുമ്പ് പഴയ നമ്പറിൽ വിളിച്ച് ഉറപ്പിക്കുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-fake-links',
    titleEn: '8. Spotting Fake Website Links',
    titleMl: '8. വ്യാജ വെബ്‌സൈറ്റ് ലിങ്കുകൾ തിരിച്ചറിയാം',
    summaryEn: 'Look carefully at the end of a website address before tapping.',
    summaryMl: 'ലിങ്കിൽ തൊടുന്നതിന് മുമ്പ് വെബ്‌സൈറ്റ് വിലാസത്തിന്റെ അവസാന ഭാഗം ശ്രദ്ധിക്കുക.',
    pointsEn: [
      'Official Indian government sites end in .gov.in or .nic.in.',
      'Watch out for extra words like sbi-kyc.xyz or hdfc-reward.top.',
    ],
    pointsMl: [
      'ഔദ്യോഗിക സർക്കാർ സൈറ്റുകൾ .gov.in എന്നാണ് അവസാനിക്കുക.',
      'അനാവശ്യ വാക്കുകളും .xyz, .top പോലുള്ള അവസാന ഭാഗങ്ങളും ശ്രദ്ധിക്കുക.',
    ],
    takeawayEn: 'Paste any link into SafeCircle first to check it.',
    takeawayMl: 'സംശയമുള്ള ലിങ്കുകൾ സേഫ്‌സർക്കിളിൽ പേസ്റ്റ് ചെയ്ത് പരിശോധിക്കുക.',
    needsNativeReview: true,
  },
  {
    id: 'lesson-after-scam',
    titleEn: '9. What To Do Right Away If You Responded',
    titleMl: '9. അബദ്ധത്തിൽ മറുപടി നൽകിയാൽ ഉടൻ ചെയ്യേണ്ടത്',
    summaryEn: 'Acting quickly helps protect your remaining money. Never feel ashamed to ask for help.',
    summaryMl: 'വേഗത്തിൽ പ്രവർത്തിക്കുന്നത് ബാക്കി പണം സംരക്ഷിക്കാൻ സഹായിക്കും. സഹായം ചോദിക്കാൻ മടിക്കരുത്.',
    pointsEn: [
      'Call your bank right away to freeze your card or UPI.',
      'Call 1930 (National Cybercrime Helpline) and tell your family immediately.',
    ],
    pointsMl: [
      'കാർഡോ യുപിഐയോ ബ്ലോക്ക് ചെയ്യാൻ ഉടൻ ബാങ്കിൽ വിളിക്കുക.',
      '1930-ൽ വിളിക്കുകയും കുടുംബത്തെ ഉടൻ അറിയിക്കുകയും ചെയ്യുക.',
    ],
    takeawayEn: 'Fast reporting gives the best chance of protection.',
    takeawayMl: 'വേഗം അറിയിക്കുന്നത് സുരക്ഷയ്ക്ക് ഏറ്റവും പ്രധാനമാണ്.',
    needsNativeReview: true,
  },
];
