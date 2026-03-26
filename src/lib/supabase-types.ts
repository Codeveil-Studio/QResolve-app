// Extended types for QResolve application
export type OrgRole = 'owner' | 'admin' | 'member';
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  is_banned?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_asset_count: number;
  stripe_base_price: number | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  type: string | null;
  location: string | null;
  status: AssetStatus;
  qr_code: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_cost: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  org_id: string;
  asset_id: string | null;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  reported_by: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  revenue_impact: 'high' | 'low' | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  org_id: string;
  title: string;
  content: string | null;
  report_type: string | null;
  generated_by: string;
  created_at: string;
}

export interface UsageHistory {
  id: string;
  org_id: string;
  asset_count: number;
  change_amount: number;
  recorded_at: string;
}

export interface Provider {
  id: string;
  provider_name: string;
  category: string | null;
  location: string | null;
  sub_locality: string | null;
  city_slug: string | null;
  contact_info: string | null;
  platform: string | null;
  rating: string | null;
  owner_id: string | null;
  description: string | null;
  website: string | null;
  business_email: string | null;
  phone: string | null;
  is_verified: boolean;
  trust_score: number;
  response_time_avg: number;
  created_at: string | null;
}

