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

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
    };
  };
};
