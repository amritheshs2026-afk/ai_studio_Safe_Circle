import type { Language } from '../engine/types';

export interface SimulatedNotificationItem {
  id: string;
  appLabel: string;
  senderLabel: string;
  language: Language | 'manglish';
  timeLabel: string;
  text: string;
  isDemoScam: boolean;
}

export interface SimulatedCallScenario {
  id: string;
  titleEn: string;
  titleMl: string;
  callerLabelEn: string;
  callerLabelMl: string;
  transcript: string;
}

export const SIMULATED_NOTIFICATIONS: SimulatedNotificationItem[] = [
  {
    id: 'notif-1',
    appLabel: 'SMS',
    senderLabel: 'Unknown Number',
    language: 'en',
    timeLabel: '2m ago',
    text: 'This is CBI Mumbai Cyber Cell. Arrest warrant issued in your Aadhaar parcel case. Stay on video call, do not tell anyone, and transfer Rs 50000 to RBI safe account immediately.',
    isDemoScam: true,
  },
  {
    id: 'notif-2',
    appLabel: 'SMS',
    senderLabel: 'AX-SBIBNK',
    language: 'en',
    timeLabel: '14m ago',
    text: 'Your OTP is 482913 for transaction of Rs 1,250 at BigBasket. Never share your OTP or PIN with anyone. -SBI',
    isDemoScam: false,
  },
  {
    id: 'notif-3',
    appLabel: 'WhatsApp',
    senderLabel: 'Electricity Help',
    language: 'en',
    timeLabel: '25m ago',
    text: 'Dear customer, your KSEB electricity will be disconnected tonight. Install AnyDesk screen sharing app and pay Rs 10 fee via https://kseb-bill-update.xyz immediately.',
    isDemoScam: true,
  },
  {
    id: 'notif-4',
    appLabel: 'WhatsApp',
    senderLabel: 'അപരിചിത നമ്പർ',
    language: 'ml',
    timeLabel: '40m ago',
    text: 'ഞാൻ സിബിഐ ഓഫീസർ ആണ്. നിങ്ങളുടെ പേരിൽ കേസ് രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. ആരോടും പറയരുത്, ഉടനെ പണം അയക്കുക.',
    isDemoScam: true,
  },
  {
    id: 'notif-5',
    appLabel: 'SMS',
    senderLabel: 'KSEB',
    language: 'ml',
    timeLabel: '1h ago',
    text: 'നിങ്ങളുടെ വൈദ്യുതി ബിൽ കൺസ്യൂമർ നമ്പർ 114582910 പ്രകാരം 640 രൂപയാണ്. https://kseb.in വഴി അടയ്ക്കാം.',
    isDemoScam: false,
  },
  {
    id: 'notif-6',
    appLabel: 'WhatsApp',
    senderLabel: 'Unknown',
    language: 'manglish',
    timeLabel: '1h ago',
    text: 'Njan police station il ninnanu. Ningalude account block aavum, aarodum parayaruthu, OTP ippol thanne parayuka.',
    isDemoScam: true,
  },
  {
    id: 'notif-7',
    appLabel: 'SMS',
    senderLabel: 'HDFCBK',
    language: 'en',
    timeLabel: '2h ago',
    text: 'A/c XX4821 debited for Rs 540.00 on 22-11-26. Avl Bal Rs 24,180.50. Never share OTP with anyone.',
    isDemoScam: false,
  },
  {
    id: 'notif-8',
    appLabel: 'WhatsApp',
    senderLabel: 'New Number',
    language: 'en',
    timeLabel: '3h ago',
    text: 'Hi Amma, this is my new number. I had an accident and need Rs 15000 urgently at the hospital. Send via UPI now and please do not tell Dad.',
    isDemoScam: true,
  },
  {
    id: 'notif-9',
    appLabel: 'WhatsApp',
    senderLabel: 'RTO Notice',
    language: 'en',
    timeLabel: '4h ago',
    text: 'RTO Challan pending Rs 2000. Download and install rto_challan_verify.apk from http://parivahan-challan-pay.top to avoid court notice.',
    isDemoScam: true,
  },
  {
    id: 'notif-10',
    appLabel: 'SMS',
    senderLabel: 'Kerala Bank',
    language: 'manglish',
    timeLabel: '5h ago',
    text: 'Ningalude OTP 739201 aanu. OTP aarodum parayaruthu. A/c XX9012 Avl Bal Rs 12,400.',
    isDemoScam: false,
  },
  {
    id: 'notif-11',
    appLabel: 'WhatsApp',
    senderLabel: 'VIP Trading',
    language: 'en',
    timeLabel: '6h ago',
    text: 'Join our VIP trading group for guaranteed returns and daily profit! Deposit Rs 5000 today to double your money in 48 hours.',
    isDemoScam: true,
  },
  {
    id: 'notif-12',
    appLabel: 'SMS',
    senderLabel: 'UIDAI',
    language: 'en',
    timeLabel: 'Yesterday',
    text: 'Aadhaar update appointment reminder: Visit your nearest Seva Kendra or check status on https://uidai.gov.in.',
    isDemoScam: false,
  },
  {
    id: 'notif-13',
    appLabel: 'WhatsApp',
    senderLabel: 'Prize Desk',
    language: 'en',
    timeLabel: 'Yesterday',
    text: 'Congratulations you won KBC lottery Rs 25 lakh! Pay Rs 3500 processing fee via GPay to claim your reward today.',
    isDemoScam: true,
  },
  {
    id: 'notif-14',
    appLabel: 'SMS',
    senderLabel: 'Medical Shop',
    language: 'en',
    timeLabel: 'Yesterday',
    text: 'Urgent reminder from City Pharmacy: Your monthly blood pressure medicine refill is ready for pickup.',
    isDemoScam: false,
  },
];

export const SIMULATED_CALL_SCENARIOS: SimulatedCallScenario[] = [
  {
    id: 'call-digital-arrest',
    titleEn: 'Fake CBI "Digital Arrest" Video Call',
    titleMl: 'വ്യാജ സിബിഐ "ഡിജിറ്റൽ അറസ്റ്റ്" വീഡിയോ കോൾ',
    callerLabelEn: 'Caller claiming to be Mumbai Cyber Crime Officer',
    callerLabelMl: 'മുംബൈ സൈബർ ക്രൈം ഓഫീസർ ആണെന്ന് അവകാശപ്പെടുന്നയാൾ',
    transcript:
      'This is CBI inspector calling from Mumbai cyber cell. Your FedEx parcel with illegal passports was seized by customs. An arrest warrant is issued. Do not disconnect the call, do not tell your family, stay on video call and transfer Rs 75000 to our RBI safe account for verification.',
  },
  {
    id: 'call-bank-kyc',
    titleEn: 'Fake Bank KYC Block Threat',
    titleMl: 'വ്യാജ ബാങ്ക് കെവൈസി ബ്ലോക്ക് ഭീഷണി',
    callerLabelEn: 'Caller claiming to be Bank Officer',
    callerLabelMl: 'ബാങ്ക് ഓഫീസർ ആണെന്ന് അവകാശപ്പെടുന്നയാൾ',
    transcript:
      'Calling from SBI head office. Your bank account will be blocked today because your KYC expired. Read out your OTP and ATM PIN right now so I can update your account immediately.',
  },
  {
    id: 'call-remote-access',
    titleEn: 'Screen-Sharing (AnyDesk) Support Lure',
    titleMl: 'സ്ക്രീൻ ഷെയറിംഗ് (AnyDesk) തട്ടിപ്പ് കോൾ',
    callerLabelEn: 'Caller offering electricity bill refund',
    callerLabelMl: 'വൈദ്യുതി ബിൽ റീഫണ്ട് വാഗ്ദാനം ചെയ്യുന്നയാൾ',
    transcript:
      'Calling from KSEB billing office. Your double payment will be refunded today. Install AnyDesk screen sharing app from the link and tell me the 9-digit code so I can verify your bank UPI.',
  },
  {
    id: 'call-emergency-relative',
    titleEn: 'Emergency Grandson / Relative Distress Call',
    titleMl: 'ബന്ധു അപകടത്തിലാണെന്ന വ്യാജ കോൾ',
    callerLabelEn: 'Caller claiming to be your grandson from a new number',
    callerLabelMl: 'പുതിയ നമ്പറിൽ നിന്ന് പേരക്കുട്ടി ആണെന്ന് പറയുന്നയാൾ',
    transcript:
      'Hi Grandma, this is your grandson calling from a new number. I had a bike accident and the police are holding me at the station. I need Rs 20000 via GPay right now. Please do not tell Dad or Mom.',
  },
  {
    id: 'call-police-verification',
    titleEn: 'Legitimate Rental Police Verification Notice',
    titleMl: 'സാധാരണ വാടകക്കാരൻ പോലീസ് വെരിഫിക്കേഷൻ അറിയിപ്പ്',
    callerLabelEn: 'Local building association notice',
    callerLabelMl: 'പ്രാദേശിക റസിഡന്റ്സ് അസോസിയേഷൻ അറിയിപ്പ്',
    transcript:
      'Hello, this is a reminder to submit the standard tenant police verification form at the local station or on the official Kerala Police website. No payment or OTP is required.',
  },
];
