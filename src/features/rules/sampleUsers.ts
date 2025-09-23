import type { SampleUser } from './types';

// Sample users for testing conditions as specified in US-004
export const SAMPLE_USERS: SampleUser[] = [
  {
    user_id: 'user_001',
    name: 'Sarah (High-Value, Has Targeted Lead)',
    customer: {
      targeted_lead: true,
      offering_types: ['Investment'],
      aum_band: '5–20M',
      risk_band: 'Aggressive',
      customer_tier: 'Platinum',
      account_age_months: 36
    },
    activity: {
      last_login_days: 2,
      page_views_30d: 45,
      product_interactions: ['Viewed Details', 'Added to Watchlist', 'Calculated Returns'],
      has_recent_transaction: true,
      session_duration_avg: 12.5
    },
    custom: {
      marketing_segment: 'High-Value',
      campaign_tags: ['Q4-Promo', 'Wealth-Focus'],
      custom_score: 92,
      feature_flags: ['beta-features', 'premium-ui', 'advanced-analytics']
    }
  },
  {
    user_id: 'user_002',
    name: 'Mike (Standard, No Targeted Lead)',
    customer: {
      targeted_lead: false,
      offering_types: ['Savings'],
      aum_band: '1–5M',
      risk_band: 'Cautious',
      customer_tier: 'Silver',
      account_age_months: 18
    },
    activity: {
      last_login_days: 7,
      page_views_30d: 12,
      product_interactions: ['Viewed Details'],
      has_recent_transaction: false,
      session_duration_avg: 5.2
    },
    custom: {
      marketing_segment: 'Retention',
      campaign_tags: ['New-Year'],
      custom_score: 65,
      feature_flags: ['mobile-enhanced']
    }
  },
  {
    user_id: 'user_003',
    name: 'Jennifer (Growth, Mixed Offerings)',
    customer: {
      targeted_lead: true,
      offering_types: ['Investment', 'Insurance'],
      aum_band: '1–5M',
      risk_band: 'Balanced',
      customer_tier: 'Gold',
      account_age_months: 24
    },
    activity: {
      last_login_days: 1,
      page_views_30d: 28,
      product_interactions: ['Viewed Details', 'Downloaded Brochure'],
      has_recent_transaction: true,
      session_duration_avg: 8.7
    },
    custom: {
      marketing_segment: 'Growth',
      campaign_tags: ['Digital-First', 'Wealth-Focus'],
      custom_score: 78,
      feature_flags: ['premium-ui', 'advanced-analytics']
    }
  },
  {
    user_id: 'user_004',
    name: 'David (Low Activity, No Lead)',
    customer: {
      targeted_lead: false,
      offering_types: ['Loan', 'Savings'],
      aum_band: '<1M',
      risk_band: 'Cautious',
      customer_tier: 'Bronze',
      account_age_months: 6
    },
    activity: {
      last_login_days: 30,
      page_views_30d: 3,
      product_interactions: [],
      has_recent_transaction: false,
      session_duration_avg: 2.1
    },
    custom: {
      marketing_segment: 'Acquisition',
      campaign_tags: [],
      custom_score: 32,
      feature_flags: []
    }
  },
  {
    user_id: 'user_005',
    name: 'Emma (Ultra High-Value, Multiple Products)',
    customer: {
      targeted_lead: true,
      offering_types: ['Investment', 'Insurance', 'Loan'],
      aum_band: '20M+',
      risk_band: 'Balanced',
      customer_tier: 'Platinum',
      account_age_months: 48
    },
    activity: {
      last_login_days: 1,
      page_views_30d: 67,
      product_interactions: ['Viewed Details', 'Added to Watchlist', 'Calculated Returns', 'Downloaded Brochure'],
      has_recent_transaction: true,
      session_duration_avg: 18.3
    },
    custom: {
      marketing_segment: 'High-Value',
      campaign_tags: ['Q4-Promo', 'Wealth-Focus', 'Digital-First'],
      custom_score: 98,
      feature_flags: ['beta-features', 'premium-ui', 'advanced-analytics', 'mobile-enhanced']
    }
  }
];

// Helper function to get user by ID
export const getUserById = (userId: string): SampleUser | undefined => {
  return SAMPLE_USERS.find(user => user.user_id === userId);
};

// Helper function to get users with targeted leads
export const getUsersWithTargetedLeads = (): SampleUser[] => {
  return SAMPLE_USERS.filter(user => user.customer.targeted_lead);
};

// Helper function to get users without targeted leads
export const getUsersWithoutTargetedLeads = (): SampleUser[] => {
  return SAMPLE_USERS.filter(user => !user.customer.targeted_lead);
};
