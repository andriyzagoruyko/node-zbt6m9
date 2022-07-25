import { UserEntry, UserDto } from './user';
import { ConflictError } from "./exceptions";
import { MEMORY_DB } from ".";
const bcrypt = require('bcryptjs');

export function getUserByUsername(name: string): UserEntry | undefined {
  return MEMORY_DB[name];
}
  
export  function getUserByEmail(email: string): UserEntry | undefined {
  return Object.values(MEMORY_DB).find(user => user.email === email);
}
  
export  function createUser(user: UserDto): UserEntry {
  if (getUserByEmail(user.email)){
    throw new ConflictError(`Email ${user.email} is already in use`)
  }

  if (getUserByUsername(user.username)){
    throw new ConflictError(`Username ${user.username} is already in use`)
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordhash = bcrypt.hashSync(user.password, salt);
  const userEntry: UserEntry = {email: user.email, type: user.type, salt, passwordhash}
  return MEMORY_DB[user.username] = userEntry
}

export  function authenticateUser(user: UserEntry, password: string) {
    return bcrypt.compareSync(password, user?.passwordhash);
}
  