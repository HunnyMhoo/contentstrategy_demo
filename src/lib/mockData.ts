export interface Rule {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Inactive';
  audienceSummary: string;
  contentSources: ('TargetedLead' | 'ProductReco' | 'CMS')[];
  schedule: string;
  lastModified: string;
}

export const mockRules: Rule[] = [
  {
    id: 'rule_001',
    name: 'Targeted Lead Priority',
    status: 'Active',
    audienceSummary: 'Targeted Lead = true AND Risk Band in [Balanced, Aggressive]',
    contentSources: ['TargetedLead', 'ProductReco'],
    schedule: 'Daily 08:00-22:00 (Asia/Bangkok)',
    lastModified: '2025-09-23 14:30',
  },
  {
    id: 'rule_002',
    name: 'High-Value Investment Focus',
    status: 'Active',
    audienceSummary: 'AUM Band = "5–20M" AND Offering Types includes "Investment"',
    contentSources: ['ProductReco', 'CMS'],
    schedule: 'Weekdays 09:00-18:00 (Asia/Bangkok)',
    lastModified: '2025-09-22 16:45',
  },
  {
    id: 'rule_003',
    name: 'Targeted Lead + HNWI Combo',
    status: 'Draft',
    audienceSummary: 'Targeted Lead = true AND AUM Band = "20M+"',
    contentSources: ['TargetedLead'],
    schedule: 'Always Active',
    lastModified: '2025-09-21 11:20',
  },
  {
    id: 'rule_004',
    name: 'Cautious Savings Campaign',
    status: 'Inactive',
    audienceSummary: 'Risk Band = "Cautious" AND Offering Types includes "Savings"',
    contentSources: ['CMS', 'ProductReco'],
    schedule: 'Weekends 10:00-20:00 (Asia/Bangkok)',
    lastModified: '2025-09-20 09:15',
  },
  {
    id: 'rule_005',
    name: 'New Customer Onboarding',
    status: 'Active',
    audienceSummary: 'Customer Age < 90 days AND Targeted Lead = false',
    contentSources: ['CMS'],
    schedule: 'Business Hours (Asia/Bangkok)',
    lastModified: '2025-09-19 13:10',
  },
  {
    id: 'rule_006',
    name: 'Premium Lead Showcase',
    status: 'Draft',
    audienceSummary: 'Targeted Lead = true AND AUM Band in ["5–20M", "20M+"]',
    contentSources: ['TargetedLead', 'ProductReco', 'CMS'],
    schedule: 'Mon-Fri 09:00-17:00 (Asia/Bangkok)',
    lastModified: '2025-09-18 16:22',
  },
  {
    id: 'rule_007',
    name: 'Insurance Focus Campaign',
    status: 'Active',
    audienceSummary: 'Offering Types includes "Insurance" AND Risk Band != "Aggressive"',
    contentSources: ['ProductReco'],
    schedule: 'Daily 10:00-21:00 (Asia/Bangkok)',
    lastModified: '2025-09-17 10:45',
  },
];

export const mockUsers = [
  {
    user_id: 'user_001',
    name: 'Sarah (High-Value, Has Targeted Lead)',
    customer: { 
      targeted_lead: true, 
      offering_types: ['Investment'], 
      risk_band: 'Aggressive', 
      aum_band: '5–20M' 
    }
  },
  {
    user_id: 'user_002', 
    name: 'Mike (Standard, No Targeted Lead)',
    customer: { 
      targeted_lead: false, 
      offering_types: ['Savings'], 
      risk_band: 'Cautious', 
      aum_band: '1–5M' 
    }
  },
  {
    user_id: 'user_003',
    name: 'Lisa (HNWI, Has Targeted Lead)',
    customer: {
      targeted_lead: true,
      offering_types: ['Investment', 'Insurance'],
      risk_band: 'Balanced',
      aum_band: '20M+'
    }
  },
  {
    user_id: 'user_004',
    name: 'David (New Customer)',
    customer: {
      targeted_lead: false,
      offering_types: ['Savings', 'Loan'],
      risk_band: 'Cautious',
      aum_band: '<1M'
    }
  }
];
