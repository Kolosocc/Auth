export interface YandexProfile extends Record<string, any> {
  id: string;
  login: string;
  default_avatar_id?: string;
  display_name?: string;
  real_name?: string;
  first_name?: string;
  last_name?: string;
  default_email?: string;
  emails?: string[];
  birthday?: string;
  gender?: string;
  avatar_id?: string;
  picture?: string;
  is_avatar_empty?: boolean;
  openid_identities?: any;
  psuid?: string;
  sex?: 'male' | 'female' | null;
  default_phone?: { id: number; number: string };
  access_token: string;
  refresh_token?: string;
}
