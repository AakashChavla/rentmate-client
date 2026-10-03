import { messageKey } from '../lib/i18n/message-key';
import { Building2, Users, Wallet, HeartHandshake } from 'lucide-react';
export const DEMO = {
  COLLECTED: 284500,
  OCCUPANCY: 94,
  RESIDENTS: 128,
  PERCENT: '%',
  BARS: [36, 48, 44, 66, 59, 75, 92],
} as const;
export const FEATURES = [
  {
    icon: Building2,
    title: messageKey('common.feature1Title'),
    body: messageKey('common.feature1Body'),
  },
  {
    icon: Users,
    title: messageKey('common.feature2Title'),
    body: messageKey('common.feature2Body'),
  },
  {
    icon: Wallet,
    title: messageKey('common.feature3Title'),
    body: messageKey('common.feature3Body'),
  },
  {
    icon: HeartHandshake,
    title: messageKey('common.feature4Title'),
    body: messageKey('common.feature4Body'),
  },
] as const;
export const STEPS = [
  { title: messageKey('common.step1Title'), body: messageKey('common.step1Body') },
  { title: messageKey('common.step2Title'), body: messageKey('common.step2Body') },
  { title: messageKey('common.step3Title'), body: messageKey('common.step3Body') },
] as const;
export const FAQ = [
  { question: messageKey('common.faq1Question'), answer: messageKey('common.faq1Answer') },
  { question: messageKey('common.faq2Question'), answer: messageKey('common.faq2Answer') },
  { question: messageKey('common.faq3Question'), answer: messageKey('common.faq3Answer') },
] as const;
export const LANDING_ANCHORS = {
  FEATURES: '#features',
  HOW: '#how-it-works',
  FAQ: '#faq',
} as const;
