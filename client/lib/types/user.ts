export interface User {
    uid: number;
    user_name: string;
    user_email: string;
    bio: string | null;
    location: string | null;
    isverified: boolean;
  }