exports.getDocumentPermissions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('permissions.user', 'email _id');
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ permissions: document.permissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const Document = require('../models/Document');
const fs = require('fs');


exports.uploadDocument = async (req, res) => {
  try {
    const { tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

 
    let existingDoc = await Document.findOne({
      fileName: req.file.originalname,
      uploadedBy: req.user._id
    });

    if (existingDoc) {
      
      const newVersion = existingDoc.version + 1;

      existingDoc.version = newVersion;
      existingDoc.filePath = req.file.path;

      existingDoc.versions.push({
        versionNumber: newVersion,
        filePath: req.file.path
      });

      await existingDoc.save();

      return res.status(200).json({
        message: 'New version uploaded',
        document: existingDoc
      });
    }


    const document = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      tags: tags ? tags.split(',') : [],
      uploadedBy: req.user._id,
      version: 1,
      versions: [
        {
          versionNumber: 1,
          filePath: req.file.path
        }
      ]
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getDocuments = async (req, res) => {
  try {
    const { tag, keyword, page = 1, limit = 5 } = req.query;

    let filter = {
      $or: [
        { uploadedBy: req.user._id },
        { 'permissions.user': req.user._id }
      ]
    };

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (keyword) {
      filter.$and = [
        {
          $or: [
            { fileName: { $regex: keyword, $options: 'i' } },
            { tags: { $regex: keyword, $options: 'i' } }
          ]
        }
      ];
    }

    const documents = await Document.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

   
    res.set('Cache-Control', 'no-store');
    res.json(documents);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      _id: document._id,
      fileName: document.fileName,
      tags: document.tags,
      uploadedBy: document.uploadedBy,
      version: document.version,
      versions: document.versions,
      permissions: document.permissions,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      console.error('Download failed: Document not found', req.params.id);
      return res.status(404).json({ message: 'Document not found' });
    }
    const userId = req.user._id.toString();
    const isOwner = document.uploadedBy.toString() === userId;
    const hasPermission = document.permissions?.some(
      (perm) =>
        perm.user.toString() === userId &&
        (perm.access === 'view' || perm.access === 'edit')
    );
    if (!isOwner && !hasPermission && req.user.role !== 'admin') {
      console.error('Download failed: Access denied', { userId, docId: document._id });
      return res.status(403).json({ message: 'Access denied' });
    }

    const fs = require('fs');
    if (!fs.existsSync(document.filePath)) {
      console.error('Download failed: File does not exist', document.filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }
    res.download(document.filePath, (err) => {
      if (err) {
        console.error('Download failed: Error sending file', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error sending file' });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.downloadSpecificVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const userId = req.user._id.toString();
    const isOwner = document.uploadedBy.toString() === userId;
    const hasPermission = document.permissions?.some(
      (perm) =>
        perm.user.toString() === userId &&
        (perm.access === 'view' || perm.access === 'edit')
    );

    if (!isOwner && !hasPermission && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const version = document.versions.find(
      (v) => v.versionNumber == req.params.versionNumber
    );

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    res.download(version.filePath);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

  
    if (
      document.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await document.deleteOne();

    res.json({ message: 'Document deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



exports.shareDocument = async (req, res) => {
  try {
    const { email, access } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can share' });
    }
    
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    if (document.permissions.some(p => p.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User already has permission' });
    }
    document.permissions.push({
      user: user._id,
      access
    });
    await document.save();
    res.json({ message: 'Document shared successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
