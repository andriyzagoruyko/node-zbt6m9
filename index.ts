const express = require('express');
const bcrypt = require('bcryptjs');
const joi = require('joi');
const app = express();
const port = 3000;

import { Request, Response } from 'express';
import { UserEntry, UserDto, userSchema } from './user';

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
  // TODO
  return undefined;
}

function getUserByEmail(email: string): UserEntry | undefined {
  // TODO
  return undefined;
}

// Request body -> UserDto
app.post('/register', async (req: Request, res: Response) => {
  try {
    const data = userSchema.validate(req.body);
    console.log(data.value);
  } catch (err) {
    console.log(err);
  }

  // Validate user object using joi
  // - username (required, min 3, max 24 characters)
  // - email (required, valid email address)
  // - type (required, select dropdown with either 'user' or 'admin')
  // - password (required, min 5, max 24 characters, upper and lower case, at least one special character)
});

// Request body -> { username: string, password: string }
app.post('/login', (req: Request, res: Response) => {
  // Return 200 if username and password match
  // Return 401 else
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
