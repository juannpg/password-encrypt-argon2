import { Router } from 'express'
import { prisma } from '../client'
import argon2 from 'argon2'

export const usersRouter = Router()

usersRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await argon2.hash(password);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error });
  }
})

usersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username as string,
      },
    });

    if (!user) {
      return res.status(400).json({ message: '1 Invalid credentials' });
    }

    const passVerify = await argon2.verify(user.password, password);

    if (!passVerify) {
      return res.status(400).json({ message: '2 Invalid credentials' });
    }

    return res.status(200).json({ message: 'Logged in successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error });
  }
})