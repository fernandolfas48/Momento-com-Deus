import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-06-30.basil',
});

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? 'price_1UD85wAObJBf0mXGThNhHRCN',
  yearly: process.env.STRIPE_PRICE_YEARLY ?? 'price_1UD88bAObJBf0mXGYdOFMgIT',
};
