
export interface UserEntry {
  email: string;
  type: 'user' | 'admin';
  salt: string;
  passwordhash: string;
}

export interface UserDto {
  username: string;
  email: string;
  type: 'user' | 'admin';
  password: string;
}

