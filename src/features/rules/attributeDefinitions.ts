import type { AttributeDefinition } from './types';

// Customer Attributes - Focus on Targeted Lead as specified in US-004
export const CUSTOMER_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'targeted_lead',
    label: 'Has Targeted Lead',
    type: 'boolean',
    group: 'customer',
    featured: true,
    description: 'Customer has an active targeted lead recommendation'
  },
  {
    id: 'offering_types',
    label: 'Offering Types',
    type: 'multi-select',
    group: 'customer',
    options: ['Investment', 'Loan', 'Insurance', 'Savings'],
    description: 'Types of financial products the customer is interested in'
  },
  {
    id: 'aum_band',
    label: 'Assets Under Management',
    type: 'enum',
    group: 'customer',
    options: ['<1M', '1–5M', '5–20M', '20M+'],
    description: 'Customer\'s total assets under management band'
  },
  {
    id: 'risk_band',
    label: 'Risk Profile',
    type: 'enum',
    group: 'customer',
    options: ['Cautious', 'Balanced', 'Aggressive'],
    description: 'Customer\'s investment risk tolerance'
  },
  {
    id: 'customer_tier',
    label: 'Customer Tier',
    type: 'enum',
    group: 'customer',
    options: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    description: 'Customer relationship tier based on value and engagement'
  },
  {
    id: 'account_age_months',
    label: 'Account Age (Months)',
    type: 'number',
    group: 'customer',
    description: 'Number of months since account was opened'
  }
];

// User Activity Attributes
export const ACTIVITY_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'last_login_days',
    label: 'Days Since Last Login',
    type: 'number',
    group: 'activity',
    description: 'Number of days since the user last logged in'
  },
  {
    id: 'page_views_30d',
    label: 'Page Views (30 days)',
    type: 'number',
    group: 'activity',
    description: 'Total page views in the last 30 days'
  },
  {
    id: 'product_interactions',
    label: 'Product Interactions',
    type: 'multi-select',
    group: 'activity',
    options: ['Viewed Details', 'Added to Watchlist', 'Calculated Returns', 'Downloaded Brochure'],
    description: 'Types of interactions with products in the last 30 days'
  },
  {
    id: 'has_recent_transaction',
    label: 'Has Recent Transaction',
    type: 'boolean',
    group: 'activity',
    description: 'Has made a transaction in the last 30 days'
  },
  {
    id: 'session_duration_avg',
    label: 'Average Session Duration (min)',
    type: 'number',
    group: 'activity',
    description: 'Average session duration in minutes over the last 30 days'
  }
];

// Custom Data Attributes
export const CUSTOM_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'marketing_segment',
    label: 'Marketing Segment',
    type: 'enum',
    group: 'custom',
    options: ['High-Value', 'Growth', 'Retention', 'Acquisition'],
    description: 'Custom marketing segmentation'
  },
  {
    id: 'campaign_tags',
    label: 'Campaign Tags',
    type: 'multi-select',
    group: 'custom',
    options: ['Q4-Promo', 'New-Year', 'Wealth-Focus', 'Digital-First'],
    description: 'Custom campaign targeting tags'
  },
  {
    id: 'custom_score',
    label: 'Custom Score',
    type: 'number',
    group: 'custom',
    description: 'Custom scoring metric (0-100)'
  },
  {
    id: 'feature_flags',
    label: 'Feature Flags',
    type: 'multi-select',
    group: 'custom',
    options: ['beta-features', 'premium-ui', 'advanced-analytics', 'mobile-enhanced'],
    description: 'Active feature flags for the user'
  }
];

// All attributes combined
export const ALL_ATTRIBUTES: AttributeDefinition[] = [
  ...CUSTOMER_ATTRIBUTES,
  ...ACTIVITY_ATTRIBUTES,
  ...CUSTOM_ATTRIBUTES
];

// Helper function to get attribute by ID
export const getAttributeById = (id: string): AttributeDefinition | undefined => {
  return ALL_ATTRIBUTES.find(attr => attr.id === id);
};

// Helper function to get attributes by group
export const getAttributesByGroup = (group: 'customer' | 'activity' | 'custom'): AttributeDefinition[] => {
  return ALL_ATTRIBUTES.filter(attr => attr.group === group);
};

// Helper function to get featured attributes (like Targeted Lead)
export const getFeaturedAttributes = (): AttributeDefinition[] => {
  return ALL_ATTRIBUTES.filter(attr => attr.featured);
};
