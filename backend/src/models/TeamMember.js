const mongoose = require('mongoose');

// Team page roster. socials: [{ label: 'LinkedIn'|'GitHub'|'Portfolio'|..., url }]
// tags: free-form badges like ['Lead', 'React']. photoUrl may be an /uploads path or any URL.
const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    year: { type: String, default: '' },
    branch: { type: String, default: '' },
    bio: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    socials: {
      type: [{ label: { type: String, default: '' }, url: { type: String, default: '' } }],
      default: [],
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    sourceRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', default: null },
  },
  { timestamps: true }
);

teamMemberSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
