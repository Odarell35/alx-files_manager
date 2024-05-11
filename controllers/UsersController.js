import dbClient from '../utils/db';
import sha1 from 'sha1';

const UsersController = {
  async postNew (req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = { email, password: hashedPassword };

    try {
      const result = await dbClient.db.collection('users').insertOne(newUser);
      const { _id } = result.ops[0];
      res.status(201).json({ id: _id, email });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default UsersController;
