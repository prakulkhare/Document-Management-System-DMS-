const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  tags: [String],

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  version: {
    type: Number,
    default: 1
  },

  versions: [
    {
      versionNumber: Number,
      filePath: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // 🔥 NEW: Permissions
  permissions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      access: {
        type: String,
        enum: ['view', 'edit']
      }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
