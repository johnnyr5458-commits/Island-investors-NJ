export type UserRole = "admin" | "team" | "partner";
export type UserStatus = "pending" | "active" | "paused" | "removed";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "archived";

export interface Profile {
  id: string;
  role: UserRole;
  status: UserStatus;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  buying_areas: string | null;
  budget: string | null;
  property_types: string | null;
  notes: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  image_url: string | null;
  image_rotation: number;
  image_position: string;
  seo_title: string | null;
  seo_description: string | null;
  categories: string[];
  tags: string[];
  status: "draft" | "published";
  author: string;
  read_time: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  best_time: string | null;
  message: string | null;
  form_type: string;
  lead_source: string;
  status: LeadStatus;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  areas: string | null;
  property_types: string | null;
  funding: string | null;
  volume: string | null;
  notes: string | null;
  form_type: string;
  lead_source: string;
  status: LeadStatus;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbPushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost> & { slug: string; title: string };
        Update: Partial<BlogPost>;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Partial<ContactSubmission> & { name: string; phone: string; address: string };
        Update: Partial<ContactSubmission>;
      };
      partner_submissions: {
        Row: PartnerSubmission;
        Insert: Partial<PartnerSubmission> & { name: string; email: string; phone: string };
        Update: Partial<PartnerSubmission>;
      };
    };
  };
};
