import mongoose from 'mongoose';

const UploadRecordSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    itemCount: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['processed', 'failed', 'distributing', 'complete'],
      default: 'processed',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('UploadRecord', UploadRecordSchema);
