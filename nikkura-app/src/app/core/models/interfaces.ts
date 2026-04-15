export interface UserModel {
  uid: string;
  email: string;
  displayName?: string;
  role: 'moe magical' | 'senpai' | 'harusama';
  createdAt: number;
}