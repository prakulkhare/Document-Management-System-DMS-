const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  downloadSpecificVersion,
  deleteDocument,
  shareDocument,
  getDocumentPermissions
} = require('../controllers/documentController');



router.get(
  '/:id/permissions',
  authMiddleware,
  getDocumentPermissions
);

router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  uploadDocument
);

router.get(
  '/',
  authMiddleware,
  getDocuments
);

router.get(
  '/:id/details',
  authMiddleware,
  getDocumentById
);

router.get(
  '/:id',
  authMiddleware,
  downloadDocument
);

router.get(
  '/:id/version/:versionNumber',
  authMiddleware,
  downloadSpecificVersion
);

router.delete(
  '/:id',
  authMiddleware,
  deleteDocument
);

router.post(
  '/:id/share',
  authMiddleware,
  shareDocument
);

module.exports = router;
