const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
const bodyParser = require('body-parser')

app.use(bodyParser.json())

import  {ValidationError, ValidationErrorItem} from "joi"
import { Request, Response } from 'express';
import { UserEntry, UserDto } from './user';
import { ConflictError } from "./exceptions";
import { loginScheme, registrationSchema } from "./schemes";

// Database mock where the username is the primary key of a user.
const MEMORY_DB: Record<string, UserEntry> = {};

// CODE HERE
//
// I want to be able to register a new unique user (username and password). After the user is created I
// should be able to login with my username and password. If a user register request is invalid a 400 error
// should be returned, if the user is already registered a conflict error should be returned.
// On login the users crendentials should be verified.
// Because we dont have a database in this environment we store the users in memory. Fill the helper functions
// to query the memory db.

function getUserByUsername(name: string): UserEntry | undefined {
  return MEMORY_DB[name];
}

function getUserByEmail(email: string): UserEntry | undefined {
  return Object.values(MEMORY_DB).find(user => user.email === email);
}

function createUser(user: UserDto): UserEntry {
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

function authenticateUser(user: UserEntry, password: string) {
  return bcrypt.compareSync(password, user?.passwordhash);
}

interface UserResponse {
  username: string
  email: string
  type: string
}

type AuthResponse = Response<UserResponse | ValidationErrorItem[] | string>

// Request body -> UserDto
// Validate user object using joi
// - username (required, min 3, max 24 characters)
// - email (required, valid email address)
// - type (required, select dropdown with either 'user' or 'admin')
// - password (required, min 5, max 24 characters, upper and lower case, at least one special character)
app.post('/register', async (req: Request, res: AuthResponse) => {
  const logPrefix = "[/register] "
  try {
    console.info(`${logPrefix} POST request received: `, req.body);
    const {username, email, type, password} = await registrationSchema.validateAsync(req.body);
    createUser({username, email, type, password})
    console.info(`${logPrefix} New user created: ${username}`);
    res.send({username, email, type});
  } catch (e) {
    if (e instanceof ValidationError) {
      console.info(`${logPrefix} Bad request: `, e.details);
      return res.status(400).send(e.details);
    } else if (e instanceof ConflictError) {
      return res.status(409).send(e.message)
    }
    console.error(`${logPrefix} Unexpected error ocurred during the request processing: `, e);
    res.status(500).send("Unhandled exception")
  }
});

// Request body -> { username: string, password: string }
  // Return 200 if username and password match
  // Return 401 else
app.post('/login', async (req: Request, res: AuthResponse) => {
  const logPrefix = "[/login] "
  try {
    console.info(`${logPrefix} POST request received: `, req.body);
    const {username, password} = await loginScheme.validateAsync(req.body);
    const user = getUserByUsername(username)

    if (!user || !authenticateUser(user, password)){
      return res.status(401).send("Wrong password or username")
    }

    console.info(`${logPrefix} ${username} successfully logged in`);
    const response = {username, email: user.email, type: user.type}
    res.status(200).send(response);
  } catch (e) {
    if (e instanceof ValidationError) {
      console.info(`${logPrefix} Bad request: `, e.details);
      return res.status(400).send(e.details);
    } 
    console.error(`${logPrefix} Unexpected error ocurred during the request processing: `, e);
    res.status(500).send("Unhandled exception")
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
