import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';

class UsersController {
  static async createUser(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    const hashedPassword = sha1(password);

    try {
      const usersCollection = dbClient.db.collection('users');
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return response.status(400).json({ error: 'User already exists' });
      } else {
        const newUser = await usersCollection.insertOne({ email, password: hashedPassword });
        return response.status(201).json({ id: newUser.insertedId, email });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async getUser(request, response) {
    try {
      const userToken = request.header('X-Token');
      if (!userToken) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      
      const authKey = `auth_${userToken}`;
      const userId = await redisClient.get(authKey);
      
      if (!userId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.getUser({ _id: ObjectId(userId) });
      if (!user) {
        return response.status(404).json({ error: 'User not found' });
      }

      return response.json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error getting user:', error);
      return response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
