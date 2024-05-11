import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AppController = {
  async getStatus (req, res) {
    const redisIsAlive = redisClient.isAlive();
    const dbIsAlive = dbClient.isAlive();

    if (redisIsAlive && dbIsAlive) {
      res.status(200).json({ redis: true, db: true });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getStats (req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default AppController;
