import mongoose from 'mongoose';

const ListItemSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UploadRecord',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Export the model using ES module syntax
export default mongoose.model('ListItem', ListItemSchema);
