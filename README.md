# Password Encryption and Authentication Using Argon2 
This project implements secure password encryption and user authentication using the Argon2 algorithm. The encryption and authentication logic is built to safeguard user passwords, preventing vulnerabilities like rainbow table attacks. 
## Installation
First, you need to add the Argon2 library to your project:  ```yarn add argon2```

## Why Argon2?

We use Argon2 to hash passwords because:

- It adds a unique, random salt to each password, ensuring that even identical passwords will produce different hashes.
- It helps avoid attacks based on precomputed hashes (rainbow tables).
- It is resistant to GPU cracking attacks, offering better security than traditional hashing algorithms.

## How It Works

### Registration Process

1. **Import the Argon2 Algorithm:** First, we import the Argon2 library in the code:
```javascript
import argon2 from "argon2"
```
2. **Require User Password:** When the user registers, we request a password through a form:
   
```javascript
const { username, password } = req.body;
```

   
3. **Hash the Password:** Using Argon2, we hash the provided password:
```javascript
const hashedPassword = await argon2.hash(password);
```

4. **Store the Hash:** The hashed password is then stored in the database, associated with the user account:
```typescript
const user = await prisma.user.create({
   data: {
      username: username as string,
      password: hashedPassword as string,
   },
});
```

At this point, the password stored in the database is encrypted as a hash.

#### Full registration code:
```typescript
import { Router } from 'express'
import { prisma } from '../client'
import argon2 from 'argon2'

export const usersRouter = Router()

usersRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // hashes the password input
  const hashedPassword = await argon2.hash(password);
  
  try {
	// creates the user with the hashed password
    const user = await prisma.user.create({
      data: {
        username: username as string,
        password: hashedPassword as string,
      },
    });

    res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error });
  }
})
```


### Login Process

1. **Require Username and Password:** When logging in, the user provides their username and password.
```javascript
const { username, password } = req.body;
```

2. **Find and Isolates User:** The system searches for the user by their unique username. We isolate it so Argon2 can get its unique salt to compare the passwords.
```typescript
const user = await prisma.user.findUnique({
   where: {
      username: username as string,
   },
});
```

3. **Verify Password:** Using the Argon2 verify function, the system checks if the password provided matches the stored hash:
```typescript
   const passwordVerified = await argon2.verify(user.password, password)
```

4. Argon2 hashes the input from the login and compares it with the stored hash. If the passwords match, the user is successfully logged in:
```typescript
if (passwordVerified) {
   return res.status(200).json({ message: "Logged in successfully" });
}
```

#### Full Login code:
```typescript
usersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
	// finds the user isolated, so argon2 can
	// use its unique salt to compare the passwords
    const user = await prisma.user.findUnique({
      where: {
        username: username as string,
      },
    });

	// if there is no user return
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

	// if there is a user, compare passwords
    const passVerify = await argon2.verify(user.password, password);

	// if password is incorrect
    if (!passVerify) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

	// if password is correct
    return res.status(200).json({ message: 'Logged in successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error });
  }
})
```

## Database Structure

The user data, including the hashed password, is stored in a database with the following schema:

- **users**
    - `id`: Integer (Primary Key)
    - `username`: String (Unique)
    - `password`: String (Hashed)

When a user registers, a new record with a hashed password is created. During login, the provided password is hashed again and compared with the stored hash.
