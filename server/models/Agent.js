
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Please add a mobile number'],
      trim: true,
      // Pre-save hook to automatically prepend +91 to the mobile number
      set: (v) => {
        // Ensure mobile number starts with +91 if not already there
        if (!v.startsWith('+91')) {
          v = `+91${v}`;
        }
        return v;
      },
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    assignedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ListItem',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
AgentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Export the model using ES module syntax
export default mongoose.model('Agent', AgentSchema);
