const mongoose = require('mongoose');

// Anonymous browser session (QR #2). Opaque id only — no PII inside the token.
// Links last verified reviewer so submit can enforce self-feedback + duplicates server-side.
const feedbackViewerSchema = new mongoose.Schema(
  {
    anonId: { type: String, required: true, unique: true },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      default: null,
    },
    reviewerTeamNumber: { type: Number, default: null },
    reviewerRole: {
      type: String,
      enum: ['founder', 'co-founder', 'member', 'audience', ''],
      default: '',
    },
    audienceName: { type: String, default: '', trim: true, maxlength: 120 },
    audiencePrn: { type: String, default: '', trim: true, maxlength: 40 },
  },
  { timestamps: true }
);

feedbackViewerSchema.index({ anonId: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackViewer', feedbackViewerSchema);
