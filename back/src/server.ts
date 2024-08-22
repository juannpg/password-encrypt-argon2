import express from 'express'
import cors from 'cors'

// router imports
import { usersRouter } from './routers/users'

export const server = express();
server.use(express.json());
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// routes
server.use('/api/routers/users', usersRouter);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});