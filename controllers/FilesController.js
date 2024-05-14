import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import AuthController from './AuthoController';

class FilesController {
  static async postUpload(request, response) {

    const token = request.header('X-Token');
    user = UsersController.getMe(request, response) ;

    console.log('TOKEN FROM FILES CONTROLLER', token);

    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
    }

    dataHeader = request.data;

    if (!dataHeader.name) {
      response.status(400).json({ error: 'Missing name' });
    }

    if (!dataHeader.type) {
      response.status(400).json({ error: 'Missing type' });
    }

    if (!dataHeader.data && dataHeader.type !== 'folder') {
      response.status(400).json({ error: 'Missing type' });
    }

    if (dataHeader.parentId) {
      if ('no file in DB for this parentId') {
	response.status(400).json({ error: 'Parent not found' });
      }

      if ('file in DB for parent is not tye folder') {
	response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
      response.status(400).json({ error: 'Parent not found' });
  }
}

export default FilesController;
