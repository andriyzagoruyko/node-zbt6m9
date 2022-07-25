import { Request, Response } from 'express';
import  {ValidationError, ValidationErrorItem} from "joi"
import { ConflictError } from './exceptions';
import { loginScheme, registrationSchema } from "./schemes"
import { authenticateUser, createUser, getUserByUsername } from "./userRepository"

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
export const registerHandler = async(req: Request, res: AuthResponse) => {
  try {
    console.info(`${req.url} POST request received: `, req.body);
    //TODO: move the validation logic into the decorator
    const {username, email, type, password} = await registrationSchema.validateAsync(req.body);
    createUser({username, email, type, password})
    console.info(`${req.url} New user created: ${username}`);
    res.send({username, email, type});
  } catch (e) {
    if (e instanceof ValidationError) {
      console.info(`${req.url} Bad request: `, e.details);
      return res.status(400).send(e.details);
    } else if (e instanceof ConflictError) {
      return res.status(409).send(e.message)
    }
    console.error(`${req.url} Unexpected error ocurred during the request processing: `, e);
    res.status(500).send("Unhandled exception")
  }
}

// Request body -> { username: string, password: string }
// Return 200 if username and password match
// Return 401 else
export const loginHandler = async (req: Request, res: AuthResponse) => {
  try {
    console.info(`${req.url} POST request received: `, req.body);
    //TODO: move the validation logic into the decorator
    const {username, password} = await loginScheme.validateAsync(req.body);
    const user = getUserByUsername(username)

    if (!user || !authenticateUser(user, password)){
      return res.status(401).send("Wrong password or username")
    }

    console.info(`${req.url} ${username} successfully logged in`);
    const response = {username, email: user.email, type: user.type}
    res.status(200).send(response);
  } catch (e) {
    if (e instanceof ValidationError) {
      console.info(`${req.url} Bad request: `, e.details);
      return res.status(400).send(e.details);
    } 
    console.error(`${req.url} Unexpected error ocurred during the request processing: `, e);
    res.status(500).send("Unhandled exception")
  }
}