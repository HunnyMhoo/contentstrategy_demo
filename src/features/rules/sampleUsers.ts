import type { SampleUser } from './types';

// Sample users for demo scenarios - Kasikornbank business demo
export const SAMPLE_USERS: SampleUser[] = [
  {
    user_id: 'user_001',
    name: 'Somchai (Near Shopping Mall - Location Based)',
    customer: {
      targeted_lead: false,
      offering_types: ['Credit Card'],
      aum_band: '1–5M',
      risk_band: 'Balanced',
      customer_tier: 'Gold',
      account_age_months: 24,
      location: 'Shopping Area',
      distance_to_mall: 300 // meters
    },
    activity: {
      last_login_days: 1,
      page_views_30d: 25,
      product_interactions: ['Viewed Credit Cards', 'Compared Rates'],
      has_recent_transaction: true,
      session_duration_avg: 8.5
    },
    custom: {
      marketing_segment: 'Growth',
      campaign_tags: ['Shopping-Promo', 'Credit-Card'],
      custom_score: 85,
      feature_flags: ['location-services', 'push-notifications']
    }
  },
  {
    user_id: 'user_002',
    name: 'Niran (Has Express Loan Targeted Lead)',
    customer: {
      targeted_lead: true,
      targeted_lead_type: 'Express Loan',
      offering_types: ['Loan'],
      aum_band: '5–20M',
      risk_band: 'Balanced',
      customer_tier: 'Platinum',
      account_age_months: 36,
      location: 'Bangkok CBD'
    },
    activity: {
      last_login_days: 2,
      page_views_30d: 35,
      product_interactions: ['Loan Calculator', 'Document Upload', 'Rate Inquiry'],
      has_recent_transaction: false,
      session_duration_avg: 15.2
    },
    custom: {
      marketing_segment: 'High-Intent-Loan',
      campaign_tags: ['Express-Loan', 'Fast-Approval'],
      custom_score: 95,
      feature_flags: ['express-processing', 'priority-support']
    }
  },
  {
    user_id: 'user_003',
    name: 'Apinya (Mutual Fund Recommendation)',
    customer: {
      targeted_lead: false,
      offering_types: ['Investment', 'Mutual Fund'],
      aum_band: '1–5M',
      risk_band: 'Moderate',
      customer_tier: 'Gold',
      account_age_months: 18,
      location: 'Sukhumvit',
      product_recommendation: 'Mutual Fund'
    },
    activity: {
      last_login_days: 3,
      page_views_30d: 22,
      product_interactions: ['Fund Performance', 'Risk Assessment', 'Portfolio Review'],
      has_recent_transaction: true,
      session_duration_avg: 12.8
    },
    custom: {
      marketing_segment: 'Investment-Growth',
      campaign_tags: ['Mutual-Fund', 'Investment-Education'],
      custom_score: 78,
      feature_flags: ['investment-tools', 'fund-analyzer']
    }
  },
  {
    user_id: 'user_004',
    name: 'Kamon (Bancassurance Recommendation)',
    customer: {
      targeted_lead: false,
      offering_types: ['Insurance', 'Bancassurance'],
      aum_band: '5–20M',
      risk_band: 'Conservative',
      customer_tier: 'Platinum',
      account_age_months: 42,
      location: 'Silom',
      product_recommendation: 'Bancassurance'
    },
    activity: {
      last_login_days: 5,
      page_views_30d: 18,
      product_interactions: ['Insurance Calculator', 'Coverage Comparison', 'Agent Contact'],
      has_recent_transaction: false,
      session_duration_avg: 9.5
    },
    custom: {
      marketing_segment: 'Protection-Focused',
      campaign_tags: ['Bancassurance', 'Family-Protection'],
      custom_score: 82,
      feature_flags: ['insurance-advisor', 'family-planning']
    }
  },
  {
    user_id: 'user_005',
    name: 'Ploy (General User - Broadcast Only)',
    customer: {
      targeted_lead: false,
      offering_types: ['Savings', 'Digital Banking'],
      aum_band: '<1M',
      risk_band: 'Conservative',
      customer_tier: 'Silver',
      account_age_months: 12,
      location: 'Chatuchak'
    },
    activity: {
      last_login_days: 7,
      page_views_30d: 8,
      product_interactions: ['Balance Inquiry', 'Transfer Money'],
      has_recent_transaction: true,
      session_duration_avg: 4.2
    },
    custom: {
      marketing_segment: 'Mass-Market',
      campaign_tags: ['Digital-Adoption', 'LINE-User'],
      custom_score: 55,
      feature_flags: ['line-integration', 'kplus-rewards']
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
