import { Request, Response } from 'express';
import prisma from '../prisma_client.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../common/setupEnv.ts';
//import { create } from 'ts-node';
//Delete this line once you use the function
//@ts-ignore
async function doesUserExist(email: string): Promise<boolean> {
  /**
   * Check if user exists in the database
   * Potentially throws an error from Prisma
   * @param email string - email of the user
   */
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    return true;
  }
  return false;
}

// Delete this line once you use the function
// @ts-ignore
async function getUser(email: string) {
  /**
   * Get user from the database
   * Potentially throws an error from Prisma
   * @param email string - email of the user
   */
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  return user;
}

//@ts-ignore
async function createUser(name: string, email: string, password: string) {
  /**
   * Create user in the database
   * Potentially throws an error from Prisma
   * @param name string - name of the user
   * @param email string - email of the user
   * @param password string - password of the user
   */
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: password,
    },
  });
  return newUser;
}

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  const userExists = await doesUserExist(email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists! Please login instead.' });
  }
  const hashed_pwd = await bcrypt.hash(password, 10);

  const user = await createUser(name, email, hashed_pwd);
  const payload = {
    id: user['id'],
    name: name,
    email: email,
    canPostEvents: user['canPostEvents'],
    isAdmin: user['isAdmin'],
  };
  const token = jwt.sign(payload, env.JWT_TOKEN_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  //Check if user exists
  const user = await getUser(email);
  if (!user) {
    return res.status(401).json({ error: 'User does not exist' });
  }

  // Validate password
  const isValidPassword = user['password'] && (await bcrypt.compare(password, user.password));
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const payload = {
    id: user['id'],
    name: user['name'],
    email: email,
    canPostEvents: user['canPostEvents'],
    isAdmin: user['isAdmin'],
  };
  const token = jwt.sign(payload, env.JWT_TOKEN_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token });
};