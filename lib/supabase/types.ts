export type UserRole = "admin" | "team" | "partner";
export type UserStatus = "pending" | "active" | "paused" | "removed";

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
    };
  };
};
