export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'volunteer';
}

export interface UserRow extends User {
  password_hash: string; 
}
