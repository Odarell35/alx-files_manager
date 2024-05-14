const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const File = require('../models/File');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

exports.postUpload = async (req, res) => {
  try {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Retrieve the user based on the token
    const user = await User.findOne({ token: req.headers['x-token'] });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if ((type !== 'folder' && !data) || (type === 'folder' && data)) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // If parentId is set, validate it
    if (parentId !== 0) {
      const parentFile = await File.findById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    let localPath = '';
    if (type !== 'folder') {
      // Decode Base64 data and save file locally
      const fileData = Buffer.from(data, 'base64');
      const fileId = uuidv4();
      localPath = path.join(FOLDER_PATH, fileId);
      fs.writeFileSync(localPath, fileData);
    }

    // Create file document
    const file = new File({
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
      localPath: type !== 'folder' ? localPath : undefined
    });

    // Save file document
    await file.save();

    return res.status(201).json(file);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
