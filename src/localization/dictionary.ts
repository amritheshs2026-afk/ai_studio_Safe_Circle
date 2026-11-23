import type { Language } from '../engine/types';

export interface TranslationDict {
  appName: string;
  tagline: string;
  langEnglish: string;
  langMalayalam: string;
  switchLangLabel: string;
  navHome: string;
  navCheck: string;
  navHistory: string;
  navFamily: string;
  navSettings: string;
  navGuardianDash: string;
  navGuardianMembers: string;
  navGuardianAlerts: string;
  navGuardianAnalytics: string;
  modeElder: string;
  modeGuardian: string;
  offlineBanner: string;
  onlineReady: string;
  updateAvailable: string;
  reloadNow: string;
  installApp: string;
  welcomeGreeting: string;
  welcomeSub: string;
  getStarted: string;
  alreadyHaveAccount: string;
  skipSetup: string;
  continueBtn: string;
  backBtn: string;
  finishBtn: string;
  setupStepLanguage: string;
  setupStepProfile: string;
  setupStepFontSize: string;
  setupStepContact: string;
  setupStepPin: string;
  yourNameLabel: string;
  yourNamePlaceholder: string;
  familyContactName: string;
  familyContactPhone: string;
  pinOptionalHint: string;
  pinEnterLabel: string;
  pinSetBtn: string;
  pinRemoveBtn: string;
  pinUnlockTitle: string;
  pinWrongError: string;
  pinLockedMsg: string;
  homeGreeting: string;
  checkMessageCta: string;
  speakMessageBtn: string;
  callFamilyBtn: string;
  addFamilyContactHint: string;
  statusCardTitle: string;
  statusLocalReady: string;
  statusSyncedReady: string;
  recentAlertsTitle: string;
  noRecentAlerts: string;
  safetyOverviewTitle: string;
  quickActionsTitle: string;
  simNotificationsTitle: string;
  simCallsTitle: string;
  learnLessonsTitle: string;
  emergencyHelpTitle: string;
  privacyDashTitle: string;
  voiceNavTitle: string;
  voiceNavSubtitle: string;
  voiceNavStartBtn: string;
  voiceNavStopBtn: string;
  voiceNavHearGuideBtn: string;
  voiceNavStopGuideBtn: string;
  voiceNavGuideScript: string;
  voiceNavListeningHint: string;
  voiceNavHeardLabel: string;
  voiceNavNotMatched: string;
  voiceNavQuickHint: string;
  checkerTitle: string;
  checkerPlaceholder: string;
  pasteBtn: string;
  clearBtn: string;
  checkNowBtn: string;
  voiceStartBtn: string;
  voiceStopBtn: string;
  voiceListening: string;
  voiceNotSupported: string;
  emptyInputError: string;
  charLimitNotice: string;
  privacyClearedNote: string;
  verdictSafe: string;
  verdictCareful: string;
  verdictDangerous: string;
  scoreLabel: string;
  whatINoticed: string;
  whatToDoNow: string;
  showOtherLang: string;
  readAloud: string;
  stopReading: string;
  noMlVoiceNote: string;
  followUpQuestion: string;
  followUpNo: string;
  followUpYes: string;
  followUpUnsure: string;
  followUpSaved: string;
  reportCyberFraud: string;
  markFalseAlarm: string;
  markedFalseAlarm: string;
  doneBtn: string;
  noGuardianAlertSentNote: string;
  guardianNotifiedNote: string;
  getSimplerExplanation: string;
  simplerExplanationLoading: string;
  simplerExplanationBadge: string;
  cloudExplainFallback: string;
  demoBannerNotif: string;
  demoBannerCall: string;
  historyTitle: string;
  historyEmpty: string;
  filterAll: string;
  markReviewed: string;
  reviewedLabel: string;
  deleteOne: string;
  deleteAll: string;
  exportJson: string;
  confirmDeleteAll: string;
  exposureScreenTitle: string;
  exposureCardTitle: string;
  effectivenessCardTitle: string;
  trendCardTitle: string;
  exposureLow: string;
  exposureModerate: string;
  exposureHigh: string;
  exposureNeedsSupport: string;
  exposureNonBlameNote: string;
  effectivenessNotEnough: string;
  effectivenessSelfReported: string;
  trendUp: string;
  trendSteady: string;
  trendDown: string;
  trendNotEnough: string;
  recTitle: string;
  recFamilyCheck: string;
  recExtraSupport: string;
  recLessons: string;
  recStayAlert: string;
  familyTitle: string;
  familyOptionalNote: string;
  signInGoogle: string;
  signOut: string;
  localContactCardTitle: string;
  saveContact: string;
  contactSaved: string;
  createInviteCode: string;
  inviteWarning: string;
  inviteExpiresIn: string;
  redeemInviteTitle: string;
  redeemInvitePlaceholder: string;
  redeemBtn: string;
  pendingRequestsTitle: string;
  approveBtn: string;
  rejectBtn: string;
  revokeBtn: string;
  shareLevelLabel: string;
  shareNone: string;
  shareAlertsOnly: string;
  shareAlertsSummary: string;
  syncConsentLabel: string;
  connectedFamilyTitle: string;
  auditLogTitle: string;
  alertTransparencyTitle: string;
  stopSharingDelete: string;
  guardianDashTitle: string;
  guardianNoElders: string;
  guardianAlertsTitle: string;
  guardianAnalyticsTitle: string;
  guardianSettingsTitle: string;
  markAsSeen: string;
  markAsReviewed: string;
  printReport: string;
  emergencyTitle: string;
  sosFloatingBtn: string;
  sosFloatingAria: string;
  sosTriggeredBanner: string;
  sosNotifySectionTitle: string;
  sosNotifySectionDesc: string;
  sosNotifyAllBtn: string;
  sosNotifyingBtn: string;
  sosSingleTapSms: string;
  sosCallContact: string;
  sosCopyMessage: string;
  sosCopiedMessage: string;
  sosAddContactBtn: string;
  sosRelationLabel: string;
  sosRelationPlaceholder: string;
  sosNoContactsHint: string;
  sosAlertSentTitle: string;
  sosGuardiansNotifiedCount: string;
  sosSmsOpenedNote: string;
  helpline1930: string;
  helpline112: string;
  cybercrimeSite: string;
  confirmExternalTitle: string;
  confirmExternalBody: string;
  openSite: string;
  cancel: string;
  recoveryDisclaimer: string;
  afterScamStepsTitle: string;
  afterScamSteps: string[];
  privacyTitle: string;
  storedLocallyTitle: string;
  storedLocallyDesc: string;
  persistentStorageLabel: string;
  cloudOptInTitle: string;
  cloudOptInDesc: string;
  cloudConsentNotice: string;
  enableCloudExplain: string;
  capabilityMatrixTitle: string;
  settingsTitle: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeHighContrast: string;
  fontScaleLabel: string;
  accentLabel: string;
  reducedMotionLabel: string;
  demoModeLabel: string;
  plansInfoTitle: string;
  helpRequestTitle: string;
  shareHandlerTitle: string;
  shareHandlerDesc: string;
  howToShareTitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    appName: 'SafeCircle',
    tagline: 'To Be Safe and To Keep Safe',
    langEnglish: 'English',
    langMalayalam: 'മലയാളം',
    switchLangLabel: 'Switch language',
    navHome: 'Home',
    navCheck: 'Check',
    navHistory: 'History',
    navFamily: 'Family',
    navSettings: 'Settings',
    navGuardianDash: 'Elders',
    navGuardianMembers: 'Family',
    navGuardianAlerts: 'Alerts',
    navGuardianAnalytics: 'Analytics',
    modeElder: 'Normal Mode',
    modeGuardian: 'Guardian Mode',
    offlineBanner: 'You are offline. Message scanning works on this device.',
    onlineReady: 'Online',
    updateAvailable: 'A new version of SafeCircle is ready.',
    reloadNow: 'Update now',
    installApp: 'Install SafeCircle App',
    welcomeGreeting: 'Welcome to SafeCircle',
    welcomeSub: 'Check suspicious messages safely on your phone. Works offline and respects your privacy.',
    getStarted: 'Get started',
    alreadyHaveAccount: 'I already have an account',
    skipSetup: 'Skip setup',
    continueBtn: 'Continue',
    backBtn: 'Back',
    finishBtn: 'Finish',
    setupStepLanguage: 'Choose your language',
    setupStepProfile: 'What should I call you?',
    setupStepFontSize: 'Choose comfortable text size',
    setupStepContact: 'Save a trusted family phone number',
    setupStepPin: 'Optional app lock PIN (4–6 digits)',
    yourNameLabel: 'Your name (optional)',
    yourNamePlaceholder: 'e.g. Amma',
    familyContactName: 'Family member name',
    familyContactPhone: 'Phone number',
    pinOptionalHint: 'Stored only on this phone to prevent others from opening your history.',
    pinEnterLabel: 'Enter 4–6 digit PIN',
    pinSetBtn: 'Save PIN',
    pinRemoveBtn: 'Turn off PIN lock',
    pinUnlockTitle: 'Enter your SafeCircle PIN',
    pinWrongError: 'That PIN did not match. Please try again.',
    pinLockedMsg: 'Too many tries. Please wait 30 seconds.',
    homeGreeting: 'Hello! I am SafeCircle. Send me any suspicious message. I will check it for you.',
    checkMessageCta: 'Check Message',
    speakMessageBtn: 'Speak Message',
    callFamilyBtn: 'Call Family',
    addFamilyContactHint: 'Add a family phone number to call quickly when unsure.',
    statusCardTitle: 'Protection Status',
    statusLocalReady: 'On-device scanning is ready (works offline)',
    statusSyncedReady: 'On-device scanning ready · Family sync active',
    recentAlertsTitle: 'Recent Checks',
    noRecentAlerts: 'No messages checked yet.',
    safetyOverviewTitle: 'Exposure & Protection',
    quickActionsTitle: 'Practice & Support',
    simNotificationsTitle: 'Sample Notifications',
    simCallsTitle: 'Call Scenarios',
    learnLessonsTitle: 'Safety Lessons',
    emergencyHelpTitle: 'Emergency Support',
    privacyDashTitle: 'Privacy Dashboard',
    voiceNavTitle: 'Voice-Guided Navigation',
    voiceNavSubtitle: 'Speak a command to open Scam Checker, Emergency (1930), or History.',
    voiceNavStartBtn: 'Speak Command',
    voiceNavStopBtn: 'Stop Listening',
    voiceNavHearGuideBtn: 'Hear Voice Guide',
    voiceNavStopGuideBtn: 'Stop Guide',
    voiceNavGuideScript: 'Say Check Message to inspect a suspicious message, Emergency for 1930 help, or History to view past checks.',
    voiceNavListeningHint: 'Listening now. Say Check Message, Emergency, or History.',
    voiceNavHeardLabel: 'Heard',
    voiceNavNotMatched: 'Did not catch a matching screen. Try saying Check Message, Emergency, or History, or tap a button below.',
    voiceNavQuickHint: 'Try saying: "Check Message", "Emergency", or "History"',
    checkerTitle: 'Check a Suspicious Message',
    checkerPlaceholder: 'Paste or type the SMS or WhatsApp message here...',
    pasteBtn: 'Paste',
    clearBtn: 'Clear',
    checkNowBtn: 'Check Now',
    voiceStartBtn: 'Push to Talk',
    voiceStopBtn: 'Stop Listening',
    voiceListening: 'Microphone is listening...',
    voiceNotSupported: 'Voice dictation is not supported in this browser.',
    emptyInputError: 'Please paste or type a message first.',
    charLimitNotice: 'Long messages are trimmed to 5,000 characters for safe checking.',
    privacyClearedNote: 'Message text is cleared from memory after checking and is never saved.',
    verdictSafe: 'SAFE',
    verdictCareful: 'BE CAREFUL',
    verdictDangerous: 'DANGEROUS',
    scoreLabel: 'Risk score',
    whatINoticed: 'What I noticed',
    whatToDoNow: 'What to do now',
    showOtherLang: 'മലയാളത്തിൽ വായിക്കുക',
    readAloud: 'Read aloud',
    stopReading: 'Stop reading',
    noMlVoiceNote: 'Malayalam voice is not installed on this device. Showing text clearly instead.',
    followUpQuestion: 'Did you reply, click a link, or send money?',
    followUpNo: 'No, I avoided it',
    followUpYes: 'Yes, I interacted',
    followUpUnsure: 'Not sure',
    followUpSaved: 'Thank you. Your response is saved locally.',
    reportCyberFraud: 'Report Cyber Fraud',
    markFalseAlarm: 'Mark as false alarm',
    markedFalseAlarm: 'Marked as false alarm',
    doneBtn: 'Done',
    noGuardianAlertSentNote: 'No alert was sent because no family guardian with sync consent is connected.',
    guardianNotifiedNote: 'Your connected family guardian has been alerted without sharing the message text.',
    getSimplerExplanation: 'Get a simpler explanation (On-Device AI)',
    simplerExplanationLoading: 'Preparing explanation on this phone...',
    simplerExplanationBadge: '100% On-Device AI (Offline · Zero Cloud)',
    cloudExplainFallback: 'Generated locally on your phone with zero internet upload.',
    demoBannerNotif: 'DEMO / SIMULATED NOTIFICATIONS — Tap any sample to test SafeCircle.',
    demoBannerCall: 'SIMULATED CALL SCENARIO — SafeCircle does not record calls or listen to live phone audio.',
    historyTitle: 'Safety History',
    historyEmpty: 'No checked messages saved yet. Raw message text is never stored.',
    filterAll: 'All',
    markReviewed: 'Mark reviewed',
    reviewedLabel: 'Reviewed',
    deleteOne: 'Delete',
    deleteAll: 'Delete all history',
    exportJson: 'Export JSON',
    confirmDeleteAll: 'Delete all local safety history? This cannot be undone.',
    exposureScreenTitle: 'Exposure & Protection Overview',
    exposureCardTitle: 'Scam Exposure (Last 30 Days)',
    effectivenessCardTitle: 'Protection Effectiveness (Self-Reported)',
    trendCardTitle: '14-Day Risk Trend',
    exposureLow: 'LOW',
    exposureModerate: 'MODERATE',
    exposureHigh: 'HIGH',
    exposureNeedsSupport: 'NEEDS ADDITIONAL SUPPORT',
    exposureNonBlameNote: 'Many scam attempts are reaching this phone. Receiving scam messages is never your fault.',
    effectivenessNotEnough: 'Not enough data yet (needs at least 5 responses).',
    effectivenessSelfReported: 'Based on your self-reported responses.',
    trendUp: 'Increasing',
    trendSteady: 'Steady',
    trendDown: 'Decreasing',
    trendNotEnough: 'Not enough data yet',
    recTitle: 'Helpful Suggestions',
    recFamilyCheck: 'Would you like a trusted family member to help review risky messages?',
    recExtraSupport: 'Consider reviewing our Safety Lessons or requesting guided support.',
    recLessons: 'Read short 2-minute scam safety lessons at your own pace.',
    recStayAlert: 'Keep checking unfamiliar links and never share your OTP or PIN.',
    familyTitle: 'Family & Guardian Linking',
    familyOptionalNote: 'Signing in is optional. SafeCircle always works locally without an account.',
    signInGoogle: 'Sign in with Google',
    signOut: 'Sign out',
    localContactCardTitle: 'Quick-Call Family Contact (On This Device)',
    saveContact: 'Save Contact',
    contactSaved: 'Family contact saved on this device.',
    createInviteCode: 'Create 15-Minute Family Invite Code',
    inviteWarning: 'Only approve someone you know personally. Never read this code to someone who phoned or messaged you.',
    inviteExpiresIn: 'Expires in',
    redeemInviteTitle: 'Join as a Family Guardian',
    redeemInvitePlaceholder: 'Enter code (e.g. ABCD-EFGH-JKLM)',
    redeemBtn: 'Send Connection Request',
    pendingRequestsTitle: 'Pending Approval Requests',
    approveBtn: 'Approve',
    rejectBtn: 'Reject',
    revokeBtn: 'Revoke Access',
    shareLevelLabel: 'Choose what to share',
    shareNone: 'Share nothing (paused)',
    shareAlertsOnly: 'Dangerous alerts only',
    shareAlertsSummary: 'Alerts and non-text safety summary',
    syncConsentLabel: 'Allow syncing non-text scan results to approved guardians',
    connectedFamilyTitle: 'Connected Family Members',
    auditLogTitle: 'Connection Activity Log',
    alertTransparencyTitle: 'Alerts Sent to Family',
    stopSharingDelete: 'Stop sharing & delete synced server data',
    guardianDashTitle: 'Guardian Dashboard',
    guardianNoElders: 'No approved elder connections yet. Enter a 15-minute code from your family member in the Family tab.',
    guardianAlertsTitle: 'Family Safety Alerts',
    guardianAnalyticsTitle: 'Scam Analytics (Non-Text Summary)',
    guardianSettingsTitle: 'Guardian Notification Preferences',
    markAsSeen: 'Mark Seen',
    markAsReviewed: 'Mark Reviewed',
    printReport: 'Print / Save Safety Report',
    emergencyTitle: 'Emergency Support',
    sosFloatingBtn: 'SOS',
    sosFloatingAria: 'Open Emergency Support and notify pre-set contacts',
    sosTriggeredBanner: 'SOS Ready — Tap once below to alert your pre-set emergency contacts, or call 1930 / 112 right away.',
    sosNotifySectionTitle: 'Pre-Set Emergency Contacts',
    sosNotifySectionDesc: 'Send an urgent SOS alert to your saved contacts and connected family guardians with a single tap.',
    sosNotifyAllBtn: 'Notify Emergency Contacts Now',
    sosNotifyingBtn: 'Sending SOS Alert...',
    sosSingleTapSms: 'Send SOS SMS',
    sosCallContact: 'Call',
    sosCopyMessage: 'Copy SOS Message',
    sosCopiedMessage: 'SOS Message Copied',
    sosAddContactBtn: 'Add Emergency Contact',
    sosRelationLabel: 'Relationship (optional)',
    sosRelationPlaceholder: 'e.g. Daughter, Son, Neighbor',
    sosNoContactsHint: 'Save at least one trusted phone number here so you can alert them in a single tap.',
    sosAlertSentTitle: 'SOS Alert Ready / Sent',
    sosGuardiansNotifiedCount: 'connected family guardian(s) notified in-app',
    sosSmsOpenedNote: 'SMS composer prepared for your pre-set phone contacts. You can also tap Call or Copy SOS Message below.',
    helpline1930: 'Call 1930 — National Cybercrime Helpline',
    helpline112: 'Call 112 — Emergency Police / Rescue',
    cybercrimeSite: 'Open cybercrime.gov.in',
    confirmExternalTitle: 'Leave SafeCircle to open official website?',
    confirmExternalBody: 'You are about to open the Government of India National Cybercrime Reporting Portal (https://cybercrime.gov.in/) in a new tab.',
    openSite: 'Open Website',
    cancel: 'Cancel',
    recoveryDisclaimer: 'Reporting quickly gives the best chance of help. Recovery of money cannot be guaranteed.',
    afterScamStepsTitle: 'What to do after a suspected scam',
    afterScamSteps: [
      '1. Stop replying to the sender immediately.',
      '2. Do not share any OTP, PIN, CVV, or password.',
      '3. Call your bank right now to block your card or UPI.',
      '4. If money was sent, call 1930 quickly.',
      '5. Keep screenshots of the chat or transaction ID.',
      '6. Tell a trusted family member right away.',
    ],
    privacyTitle: 'Privacy Dashboard',
    storedLocallyTitle: 'Stored on this phone only',
    storedLocallyDesc: 'Profile name, accessibility preferences, local family contact, PIN hash, and non-text scan results (score, verdict, tactic IDs, date). Raw message text is never saved.',
    persistentStorageLabel: 'Persistent browser storage',
    cloudOptInTitle: '100% Local On-Device AI',
    cloudOptInDesc: 'Both scam classification and simpler plain-language explanations run strictly inside your browser. Zero message text or tactic signals are sent to external AI servers.',
    cloudConsentNotice: 'Runs completely offline on this phone with zero cloud AI calls.',
    enableCloudExplain: 'Enable On-Device AI assistance & simpler explanations',
    capabilityMatrixTitle: 'PWA vs Android App Capabilities',
    settingsTitle: 'Settings & Accessibility',
    themeLabel: 'Display Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeHighContrast: 'High Contrast (AAA)',
    fontScaleLabel: 'Text Size',
    accentLabel: 'Accent Color',
    reducedMotionLabel: 'Reduce Motion',
    demoModeLabel: 'Show Demo / Simulated Scenarios',
    plansInfoTitle: 'Plans Information',
    helpRequestTitle: 'Request Guidance',
    shareHandlerTitle: 'Shared Message Ready to Check',
    shareHandlerDesc: 'Review the shared text below and tap Check Now. Nothing is saved until you scan.',
    howToShareTitle: 'How to share a message to SafeCircle',
  },
  ml: {
    appName: 'സേഫ്‌സർക്കിൾ (SafeCircle)',
    tagline: 'സുരക്ഷിതരായിരിക്കാനും സുരക്ഷിതരാക്കാനും',
    langEnglish: 'English',
    langMalayalam: 'മലയാളം',
    switchLangLabel: 'ഭാഷ മാറ്റുക',
    navHome: 'ഹോം',
    navCheck: 'പരിശോധിക്കുക',
    navHistory: 'ചരിത്രം',
    navFamily: 'കുടുംബം',
    navSettings: 'ക്രമീകരണം',
    navGuardianDash: 'മുതിർന്നവർ',
    navGuardianMembers: 'കുടുംബം',
    navGuardianAlerts: 'അറിയിപ്പുകൾ',
    navGuardianAnalytics: 'വിശകലനം',
    modeElder: 'സാധാരണ മോഡ്',
    modeGuardian: 'ഗാർഡിയൻ മോഡ്',
    offlineBanner: 'ഇന്റർനെറ്റ് ഇല്ല. സന്ദേശ പരിശോധന ഫോണിൽ തന്നെ പ്രവർത്തിക്കും.',
    onlineReady: 'ഓൺലൈൻ',
    updateAvailable: 'സേഫ്‌സർക്കിളിന്റെ പുതിയ പതിപ്പ് ലഭ്യമാണ്.',
    reloadNow: 'ഇപ്പോൾ അപ്ഡേറ്റ് ചെയ്യുക',
    installApp: 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
    welcomeGreeting: 'സേഫ്‌സർക്കിളിലേക്ക് സ്വാഗതം',
    welcomeSub: 'സംശയാസ്പദമായ സന്ദേശങ്ങൾ ഫോണിൽ തന്നെ സുരക്ഷിതമായി പരിശോധിക്കുക.',
    getStarted: 'തുടങ്ങാം',
    alreadyHaveAccount: 'എനിക്ക് അക്കൗണ്ട് ഉണ്ട്',
    skipSetup: 'ഒഴിവാക്കുക',
    continueBtn: 'തുടരുക',
    backBtn: 'തിരികെ',
    finishBtn: 'പൂർത്തിയാക്കുക',
    setupStepLanguage: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    setupStepProfile: 'നിങ്ങളെ എന്ത് വിളിക്കണം?',
    setupStepFontSize: 'വായിക്കാൻ എളുപ്പമുള്ള അക്ഷര വലിപ്പം',
    setupStepContact: 'കുടുംബത്തിലെ ഒരാളുടെ ഫോൺ നമ്പർ ചേർക്കുക',
    setupStepPin: 'ആപ്പ് ലോക്ക് പിൻ (4–6 അക്കം, നിർബന്ധമില്ല)',
    yourNameLabel: 'നിങ്ങളുടെ പേര് (നിർബന്ധമില്ല)',
    yourNamePlaceholder: 'ഉദാ: അമ്മ',
    familyContactName: 'കുടുംബാംഗത്തിന്റെ പേര്',
    familyContactPhone: 'ഫോൺ നമ്പർ',
    pinOptionalHint: 'ചരിത്രം മറ്റുള്ളവർ കാണാതിരിക്കാൻ ഈ ഫോണിൽ മാത്രം സൂക്ഷിക്കുന്നു.',
    pinEnterLabel: '4–6 അക്ക പിൻ നൽകുക',
    pinSetBtn: 'പിൻ സേവ് ചെയ്യുക',
    pinRemoveBtn: 'പിൻ ലോക്ക് ഒഴിവാക്കുക',
    pinUnlockTitle: 'സേഫ്‌സർക്കിൾ പിൻ നൽകുക',
    pinWrongError: 'പിൻ തെറ്റാണ്. വീണ്ടും ശ്രമിക്കുക.',
    pinLockedMsg: 'കൂടുതൽ തവണ തെറ്റി. 30 സെക്കൻഡ് കാത്തിരിക്കുക.',
    homeGreeting: 'നമസ്കാരം! ഞാൻ സേഫ്‌സർക്കിൾ. സംശയമുള്ള ഏത് സന്ദേശവും എനിക്ക് അയക്കൂ, ഞാൻ പരിശോധിക്കാം.',
    checkMessageCta: 'സന്ദേശം പരിശോധിക്കുക',
    speakMessageBtn: 'സംസാരിച്ച് പരിശോധിക്കുക',
    callFamilyBtn: 'കുടുംബത്തെ വിളിക്കുക',
    addFamilyContactHint: 'സംശയം തോന്നുമ്പോൾ വേഗം വിളിക്കാൻ കുടുംബ നമ്പർ ചേർക്കുക.',
    statusCardTitle: 'സുരക്ഷാ നില',
    statusLocalReady: 'ഫോണിലെ പരിശോധന തയ്യാറാണ് (ഓഫ്‌ലൈൻ ലഭ്യമാണ്)',
    statusSyncedReady: 'പരിശോധന തയ്യാറാണ് · കുടുംബ സിങ്ക് സജീവമാണ്',
    recentAlertsTitle: 'സമീപകാല പരിശോധനകൾ',
    noRecentAlerts: 'ഇതുവരെ സന്ദേശങ്ങൾ പരിശോധിച്ചിട്ടില്ല.',
    safetyOverviewTitle: 'സുരക്ഷാ അവലോകനം',
    quickActionsTitle: 'പരിശീലനവും സഹായവും',
    simNotificationsTitle: 'മാതൃകാ അറിയിപ്പുകൾ',
    simCallsTitle: 'കോൾ മാതൃകകൾ',
    learnLessonsTitle: 'സുരക്ഷാ പാഠങ്ങൾ',
    emergencyHelpTitle: 'അടിയന്തര സഹായം',
    privacyDashTitle: 'സ്വകാര്യതാ വിവരങ്ങൾ',
    voiceNavTitle: 'ശബ്ദത്തിലൂടെയുള്ള വഴികാട്ടി',
    voiceNavSubtitle: 'സന്ദേശ പരിശോധന, അടിയന്തര സഹായം (1930), അല്ലെങ്കിൽ ചരിത്രം തുറക്കാൻ സംസാരിക്കുക.',
    voiceNavStartBtn: 'സംസാരിച്ച് തുറക്കുക',
    voiceNavStopBtn: 'നിർത്തുക',
    voiceNavHearGuideBtn: 'നിർദ്ദേശങ്ങൾ കേൾക്കുക',
    voiceNavStopGuideBtn: 'നിർത്തുക',
    voiceNavGuideScript: 'സന്ദേശം പരിശോധിക്കാൻ ചെക്ക് മെസ്സേജ് എന്നോ, അടിയന്തര സഹായത്തിന് എമർജൻസി എന്നോ, പഴയ പരിശോധനകൾക്ക് ഹിസ്റ്ററി എന്നോ പറയുക.',
    voiceNavListeningHint: 'കേൾക്കുന്നുണ്ട്. ചെക്ക് മെസ്സേജ്, എമർജൻസി, അല്ലെങ്കിൽ ഹിസ്റ്ററി എന്ന് പറയുക.',
    voiceNavHeardLabel: 'കേട്ടത്',
    voiceNavNotMatched: 'ആവശ്യം മനസ്സിലായില്ല. ചെക്ക് മെസ്സേജ്, എമർജൻസി, അല്ലെങ്കിൽ ഹിസ്റ്ററി എന്ന് പറയുകയോ താഴെ തൊടുകയോ ചെയ്യുക.',
    voiceNavQuickHint: 'പറഞ്ഞു നോക്കൂ: "ചെക്ക് മെസ്സേജ്", "എമർജൻസി", അല്ലെങ്കിൽ "ഹിസ്റ്ററി"',
    checkerTitle: 'സംശയാസ്പദമായ സന്ദേശം പരിശോധിക്കുക',
    checkerPlaceholder: 'SMS അല്ലെങ്കിൽ WhatsApp സന്ദേശം ഇവിടെ പേസ്റ്റ് ചെയ്യുക...',
    pasteBtn: 'പേസ്റ്റ്',
    clearBtn: 'മായ്ക്കുക',
    checkNowBtn: 'ഇപ്പോൾ പരിശോധിക്കുക',
    voiceStartBtn: 'സംസാരിക്കാൻ തൊടുക',
    voiceStopBtn: 'നിർത്തുക',
    voiceListening: 'മൈക്രോഫോൺ കേൾക്കുന്നു...',
    voiceNotSupported: 'ഈ ബ്രൗസറിൽ വോയ്സ് ടൈപ്പിംഗ് ലഭ്യമല്ല.',
    emptyInputError: 'ദയവായി ആദ്യം ഒരു സന്ദേശം ചേർക്കുക.',
    charLimitNotice: 'വലിയ സന്ദേശങ്ങൾ സുരക്ഷിതമായി പരിശോധിക്കാൻ 5,000 അക്ഷരങ്ങളായി ചുരുക്കും.',
    privacyClearedNote: 'പരിശോധനയ്ക്ക് ശേഷം സന്ദേശം മെമ്മറിയിൽ നിന്ന് മായ്ക്കുന്നു. ഒരിക്കലും സൂക്ഷിക്കില്ല.',
    verdictSafe: 'സുരക്ഷിതം (SAFE)',
    verdictCareful: 'ശ്രദ്ധിക്കുക (BE CAREFUL)',
    verdictDangerous: 'അപകടകരം (DANGEROUS)',
    scoreLabel: 'റിസ്ക് സ്കോർ',
    whatINoticed: 'ഞാൻ ശ്രദ്ധിച്ച കാര്യങ്ങൾ',
    whatToDoNow: 'ഇനി എന്ത് ചെയ്യണം',
    showOtherLang: 'Read in English',
    readAloud: 'ഉറക്കെ വായിക്കുക',
    stopReading: 'വായന നിർത്തുക',
    noMlVoiceNote: 'ഈ ഫോണിൽ മലയാളം ശബ്ദം ഇൻസ്റ്റാൾ ചെയ്തിട്ടില്ല. എഴുത്ത് വ്യക്തമായി കാണിക്കുന്നു.',
    followUpQuestion: 'നിങ്ങൾ മറുപടി നൽകുകയോ ലിങ്കിൽ തൊടുകയോ പണം അയക്കുകയോ ചെയ്തോ?',
    followUpNo: 'ഇല്ല, ഒഴിവാക്കി',
    followUpYes: 'അതെ, ചെയ്തു',
    followUpUnsure: 'ഉറപ്പില്ല',
    followUpSaved: 'നന്ദി. നിങ്ങളുടെ മറുപടി ഫോണിൽ സൂക്ഷിച്ചു.',
    reportCyberFraud: 'സൈബർ തട്ടിപ്പ് റിപ്പോർട്ട് ചെയ്യുക',
    markFalseAlarm: 'തെറ്റായ മുന്നറിയിപ്പാണെന്ന് അടയാളപ്പെടുത്തുക',
    markedFalseAlarm: 'തെറ്റായ മുന്നറിയിപ്പായി അടയാളപ്പെടുത്തി',
    doneBtn: 'പൂർത്തിയായി',
    noGuardianAlertSentNote: 'സമ്മതമുള്ള കുടുംബ ഗാർഡിയൻ ബന്ധിപ്പിക്കാത്തതിനാൽ അറിയിപ്പ് അയച്ചിട്ടില്ല.',
    guardianNotifiedNote: 'സന്ദേശത്തിലെ വാക്കുകൾ ഇല്ലാതെ അപകട മുന്നറിയിപ്പ് കുടുംബ ഗാർഡിയന് അയച്ചു.',
    getSimplerExplanation: 'ലളിതമായ വിശദീകരണം നേടുക (ഫോണിലെ AI)',
    simplerExplanationLoading: 'ഈ ഫോണിൽ തന്നെ തയ്യാറാക്കുന്നു...',
    simplerExplanationBadge: '100% ഫോണിലെ AI (ഓഫ്‌ലൈൻ · ക്ലൗഡ് ഇല്ല)',
    cloudExplainFallback: 'ഇന്റർനെറ്റിലേക്ക് ഒന്നും അയക്കാതെ ഈ ഫോണിൽ തന്നെ തയ്യാറാക്കിയത്.',
    demoBannerNotif: 'മാതൃകാ അറിയിപ്പുകൾ (DEMO) — പരിശോധിക്കാൻ ഏതെങ്കിലും ഒന്നിൽ തൊടുക.',
    demoBannerCall: 'മാതൃകാ കോൾ രംഗം — സേഫ്‌സർക്കിൾ ഫോൺ കോളുകൾ റെക്കോർഡ് ചെയ്യുന്നില്ല.',
    historyTitle: 'സുരക്ഷാ ചരിത്രം',
    historyEmpty: 'പരിശോധിച്ച സന്ദേശങ്ങളൊന്നും ഇതുവരെ ഇല്ല. സന്ദേശത്തിലെ വാക്കുകൾ സൂക്ഷിക്കുന്നില്ല.',
    filterAll: 'എല്ലാം',
    markReviewed: 'പരിശോധിച്ചു',
    reviewedLabel: 'പരിശോധിച്ചത്',
    deleteOne: 'മായ്ക്കുക',
    deleteAll: 'എല്ലാം മായ്ക്കുക',
    exportJson: 'JSON എക്സ്പോർട്ട്',
    confirmDeleteAll: 'എല്ലാ സുരക്ഷാ ചരിത്രവും മായ്ക്കണോ? ഇത് തിരിച്ചെടുക്കാനാവില്ല.',
    exposureScreenTitle: 'സുരക്ഷാ അവലോകനം',
    exposureCardTitle: 'തട്ടിപ്പ് ശ്രമങ്ങൾ (കഴിഞ്ഞ 30 ദിവസം)',
    effectivenessCardTitle: 'പ്രതിരോധ മികവ് (സ്വയം രേഖപ്പെടുത്തിയത്)',
    trendCardTitle: '14 ദിവസത്തെ മാറ്റം',
    exposureLow: 'കുറവ്',
    exposureModerate: 'മിതമായത്',
    exposureHigh: 'കൂടുതൽ',
    exposureNeedsSupport: 'കൂടുതൽ സഹായം ആവശ്യമാണ്',
    exposureNonBlameNote: 'ഈ ഫോണിലേക്ക് ധാരാളം തട്ടിപ്പ് ശ്രമങ്ങൾ എത്തുന്നുണ്ട്. ഇത് ഒരിക്കലും നിങ്ങളുടെ തെറ്റല്ല.',
    effectivenessNotEnough: 'ആവശ്യമായ വിവരങ്ങൾ ആയിട്ടില്ല (കുറഞ്ഞത് 5 മറുപടികൾ വേണം).',
    effectivenessSelfReported: 'നിങ്ങൾ നൽകിയ മറുപടികളെ അടിസ്ഥാനമാക്കി.',
    trendUp: 'കൂടുന്നു',
    trendSteady: 'മാറ്റമില്ല',
    trendDown: 'കുറയുന്നു',
    trendNotEnough: 'വിവരങ്ങൾ കുറവാണ്',
    recTitle: 'സഹായകരമായ നിർദ്ദേശങ്ങൾ',
    recFamilyCheck: 'സംശയമുള്ള സന്ദേശങ്ങൾ പരിശോധിക്കാൻ കുടുംബാംഗത്തിന്റെ സഹായം തേടണോ?',
    recExtraSupport: 'സുരക്ഷാ പാഠങ്ങൾ വായിക്കുകയോ മാർഗ്ഗനിർദ്ദേശം തേടുകയോ ചെയ്യാം.',
    recLessons: 'രണ്ട് മിനിറ്റുള്ള ലളിതമായ സുരക്ഷാ പാഠങ്ങൾ വായിക്കാം.',
    recStayAlert: 'അപരിചിത ലിങ്കുകൾ തുറക്കരുത്. ഒടിപിയും പിന്നും ആരോടും പറയരുത്.',
    familyTitle: 'കുടുംബ ബന്ധം (Guardian)',
    familyOptionalNote: 'സൈൻ ഇൻ നിർബന്ധമില്ല. അക്കൗണ്ട് ഇല്ലാതെയും ആപ്പ് പ്രവർത്തിക്കും.',
    signInGoogle: 'Google വഴി സൈൻ ഇൻ ചെയ്യുക',
    signOut: 'സൈൻ ഔട്ട്',
    localContactCardTitle: 'വേഗം വിളിക്കാനുള്ള കുടുംബ നമ്പർ (ഈ ഫോണിൽ)',
    saveContact: 'സേവ് ചെയ്യുക',
    contactSaved: 'കുടുംബ നമ്പർ ഈ ഫോണിൽ സൂക്ഷിച്ചു.',
    createInviteCode: '15 മിനിറ്റ് കുടുംബ കോഡ് നിർമ്മിക്കുക',
    inviteWarning: 'നിങ്ങൾക്ക് നേരിട്ട് അറിയാവുന്നവരെ മാത്രം അംഗീകരിക്കുക. ഫോണിലൂടെയോ മെസ്സേജിലൂടെയോ ചോദിക്കുന്നവർക്ക് ഈ കോഡ് വായിച്ചു കൊടുക്കരുത്.',
    inviteExpiresIn: 'കാലാവധി',
    redeemInviteTitle: 'കുടുംബ ഗാർഡിയനായി ചേരുക',
    redeemInvitePlaceholder: 'കോഡ് നൽകുക (ഉദാ: ABCD-EFGH-JKLM)',
    redeemBtn: 'അഭ്യർത്ഥന അയക്കുക',
    pendingRequestsTitle: 'അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നവർ',
    approveBtn: 'അംഗീകരിക്കുക',
    rejectBtn: 'നിരസിക്കുക',
    revokeBtn: 'ബന്ധം റദ്ദാക്കുക',
    shareLevelLabel: 'എന്ത് പങ്കുവയ്ക്കണം',
    shareNone: 'ഒന്നും പങ്കുവയ്ക്കേണ്ട',
    shareAlertsOnly: 'അപകട മുന്നറിയിപ്പുകൾ മാത്രം',
    shareAlertsSummary: 'മുന്നറിയിപ്പുകളും ചുരുക്ക വിവരങ്ങളും',
    syncConsentLabel: 'അംഗീകരിച്ച കുടുംബാംഗങ്ങൾക്ക് സന്ദേശമില്ലാത്ത സുരക്ഷാ ഫലം അയക്കാൻ സമ്മതിക്കുക',
    connectedFamilyTitle: 'ബന്ധിപ്പിച്ച കുടുംബാംഗങ്ങൾ',
    auditLogTitle: 'പ്രവർത്തന രേഖ',
    alertTransparencyTitle: 'കുടുംബത്തിന് അയച്ച അറിയിപ്പുകൾ',
    stopSharingDelete: 'പങ്കുവയ്ക്കൽ നിർത്തി സെർവർ വിവരങ്ങൾ മായ്ക്കുക',
    guardianDashTitle: 'ഗാർഡിയൻ ഡാഷ്‌ബോർഡ്',
    guardianNoElders: 'അംഗീകരിച്ച ബന്ധങ്ങളില്ല. കുടുംബ ടാബിൽ 15 മിനിറ്റ് കോഡ് നൽകുക.',
    guardianAlertsTitle: 'കുടുംബ സുരക്ഷാ അറിയിപ്പുകൾ',
    guardianAnalyticsTitle: 'തട്ടിപ്പ് വിശകലനം',
    guardianSettingsTitle: 'ഗാർഡിയൻ അറിയിപ്പ് ക്രമീകരണം',
    markAsSeen: 'കണ്ടു',
    markAsReviewed: 'പരിശോധിച്ചു',
    printReport: 'സുരക്ഷാ റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക',
    emergencyTitle: 'അടിയന്തര സഹായം',
    sosFloatingBtn: 'SOS',
    sosFloatingAria: 'അടിയന്തര സഹായം തുറന്ന് കുടുംബാംഗങ്ങളെ അറിയിക്കുക',
    sosTriggeredBanner: 'SOS തയ്യാറാണ് — മുൻകൂട്ടി ചേർത്ത നമ്പറുകളിലേക്ക് ഒറ്റ ടാപ്പിൽ അറിയിപ്പ് അയക്കുകയോ 1930 / 112 വിളിക്കുകയോ ചെയ്യുക.',
    sosNotifySectionTitle: 'മുൻകൂട്ടി ചേർത്ത അടിയന്തര നമ്പറുകൾ',
    sosNotifySectionDesc: 'ഒറ്റ ടാപ്പിലൂടെ നിങ്ങളുടെ വിശ്വസ്തരായ ബന്ധുക്കൾക്കും കുടുംബ ഗാർഡിയൻമാർക്കും അടിയന്തര SOS അറിയിപ്പ് അയക്കുക.',
    sosNotifyAllBtn: 'അടിയന്തര നമ്പറുകളെ ഇപ്പോൾ അറിയിക്കുക',
    sosNotifyingBtn: 'SOS അറിയിപ്പ് അയക്കുന്നു...',
    sosSingleTapSms: 'SOS SMS അയക്കുക',
    sosCallContact: 'വിളിക്കുക',
    sosCopyMessage: 'SOS സന്ദേശം പകർത്തുക',
    sosCopiedMessage: 'SOS സന്ദേശം പകർത്തി',
    sosAddContactBtn: 'അടിയന്തര നമ്പർ ചേർക്കുക',
    sosRelationLabel: 'ബന്ധം (നിർബന്ധമില്ല)',
    sosRelationPlaceholder: 'ഉദാ: മകൾ, മകൻ, അയൽവാസി',
    sosNoContactsHint: 'ഒറ്റ ടാപ്പിൽ സഹായം അറിയിക്കാൻ കുറഞ്ഞത് ഒരു വിശ്വസ്ത ഫോൺ നമ്പറെങ്കിലും ഇവിടെ ചേർക്കുക.',
    sosAlertSentTitle: 'SOS അറിയിപ്പ് തയ്യാറായി / അയച്ചു',
    sosGuardiansNotifiedCount: 'കുടുംബ ഗാർഡിയൻമാർക്ക് ആപ്പ് വഴി അറിയിപ്പ് അയച്ചു',
    sosSmsOpenedNote: 'നിങ്ങളുടെ അടിയന്തര നമ്പറുകളിലേക്ക് SMS തയ്യാറാക്കി. താഴെയുള്ള വിളിക്കുക അല്ലെങ്കിൽ പകർത്തുക ബട്ടണും ഉപയോഗിക്കാം.',
    helpline1930: '1930 വിളിക്കുക — ദേശീയ സൈബർ ക്രൈം ഹെൽപ്പ്‌ലൈൻ',
    helpline112: '112 വിളിക്കുക — അടിയന്തര പോലീസ് സഹായം',
    cybercrimeSite: 'cybercrime.gov.in തുറക്കുക',
    confirmExternalTitle: 'ഔദ്യോഗിക വെബ്‌സൈറ്റിലേക്ക് പോകണോ?',
    confirmExternalBody: 'ഇന്ത്യാ ഗവൺമെന്റിന്റെ സൈബർ ക്രൈം പോർട്ടൽ (https://cybercrime.gov.in/) പുതിയ ടാബിൽ തുറക്കും.',
    openSite: 'തുറക്കുക',
    cancel: 'റദ്ദാക്കുക',
    recoveryDisclaimer: 'വേഗം റിപ്പോർട്ട് ചെയ്യുന്നത് സഹായം ലഭിക്കാൻ സാധ്യത കൂട്ടും. പണം തിരികെ കിട്ടുമെന്ന് ഉറപ്പ് നൽകാനാവില്ല.',
    afterScamStepsTitle: 'തട്ടിപ്പ് സംശയിച്ചാൽ ഉടൻ ചെയ്യേണ്ടത്',
    afterScamSteps: [
      '1. സന്ദേശത്തിന് മറുപടി നൽകുന്നത് ഉടൻ നിർത്തുക.',
      '2. ഒടിപി, പിൻ, സിവിവി, പാസ്‌വേഡ് എന്നിവ പങ്കുവയ്ക്കരുത്.',
      '3. കാർഡോ യുപിഐയോ ബ്ലോക്ക് ചെയ്യാൻ ഉടൻ ബാങ്കിൽ വിളിക്കുക.',
      '4. പണം നഷ്ടമായെങ്കിൽ വേഗം 1930-ൽ വിളിക്കുക.',
      '5. ചാറ്റിന്റെയോ ഇടപാടിന്റെയോ സ്ക്രീൻഷോട്ട് സൂക്ഷിക്കുക.',
      '6. വിശ്വസ്തനായ കുടുംബാംഗത്തെ ഉടൻ അറിയിക്കുക.',
    ],
    privacyTitle: 'സ്വകാര്യതാ വിവരങ്ങൾ',
    storedLocallyTitle: 'ഈ ഫോണിൽ മാത്രം സൂക്ഷിക്കുന്നത്',
    storedLocallyDesc: 'പേര്, വലിപ്പം/തീം ക്രമീകരണങ്ങൾ, കുടുംബ ഫോൺ നമ്പർ, പിൻ ഹാഷ്, സന്ദേശമില്ലാത്ത പരിശോധനാ ഫലങ്ങൾ. സന്ദേശത്തിലെ വാക്കുകൾ ഒരിക്കലും സൂക്ഷിക്കില്ല.',
    persistentStorageLabel: 'ഫോൺ സ്റ്റോറേജ് സ്ഥിരത',
    cloudOptInTitle: '100% ഫോണിലെ ഓൺ-ഡിവൈസ് AI',
    cloudOptInDesc: 'തട്ടിപ്പ് പരിശോധനയും ലളിതമായ വിശദീകരണവും പൂർണ്ണമായും ഈ ഫോണിൽ തന്നെ പ്രവർത്തിക്കുന്നു. ഒരു വിവരവും ക്ലൗഡ് AI സെർവറിലേക്ക് അയക്കില്ല.',
    cloudConsentNotice: 'ഇന്റർനെറ്റോ ക്ലൗഡ് AI-യോ ഇല്ലാതെ പൂർണ്ണമായും ഓഫ്‌ലൈനിൽ പ്രവർത്തിക്കുന്നു.',
    enableCloudExplain: 'ഫോണിലെ AI സഹായവും ലളിതമായ വിശദീകരണവും ഓൺ ആക്കുക',
    capabilityMatrixTitle: 'PWA vs Android ആപ്പ് സൗകര്യങ്ങൾ',
    settingsTitle: 'ക്രമീകരണങ്ങളും സൗകര്യങ്ങളും',
    themeLabel: 'തീം തിരഞ്ഞെടുക്കുക',
    themeLight: 'ലൈറ്റ് (Light)',
    themeDark: 'ഡാർക്ക് (Dark)',
    themeHighContrast: 'ഹൈ കോൺട്രാസ്റ്റ് (AAA)',
    fontScaleLabel: 'അക്ഷര വലിപ്പം',
    accentLabel: 'പ്രധാന നിറം',
    reducedMotionLabel: 'ചലനങ്ങൾ കുറയ്ക്കുക',
    demoModeLabel: 'മാതൃകാ സന്ദേശങ്ങൾ (Demo Mode) കാണിക്കുക',
    plansInfoTitle: 'പ്ലാൻ വിവരങ്ങൾ',
    helpRequestTitle: 'സഹായ അഭ്യർത്ഥന',
    shareHandlerTitle: 'പങ്കുവച്ച സന്ദേശം പരിശോധിക്കാൻ തയ്യാറാണ്',
    shareHandlerDesc: 'താഴെ കാണുന്ന സന്ദേശം പരിശോധിച്ച് "ഇപ്പോൾ പരിശോധിക്കുക" അമർത്തുക.',
    howToShareTitle: 'മറ്റു ആപ്പുകളിൽ നിന്ന് സന്ദേശം എങ്ങനെ പങ്കുവയ്ക്കാം',
  },
};

export function useTranslation(lang: Language): TranslationDict {
  return TRANSLATIONS[lang];
}
