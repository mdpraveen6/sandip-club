const mongoose = require('mongoose');

const ratingField = { type: Number, required: true, min: 1, max: 5 };

// Anonymous peer feedback for one presentation session (QR #2).
// Uniqueness (presentationSessionId + anonId) enforced at DB level.
const feedbackSchema = new mongoose.Schema(
  {
    presentationSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PresentationSession',
      required: true,
    },
    anonId: { type: String, required: true },
    reviewerRegistrationId: {
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
    presentingRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    teamNumber: { type: Number, required: true },
    ratings: {
      innovation: ratingField,
      clarity: ratingField,
      solution: ratingField,
      market: ratingField,
      feasibility: ratingField,
      presentation: ratingField,
    },
    likedMost: { type: String, default: '', maxlength: 1000 },
    improve: { type: String, default: '', maxlength: 1000 },
    wouldUse: { type: String, enum: ['YES', 'MAYBE', 'NO', ''], default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ presentationSessionId: 1, anonId: 1 }, { unique: true });
feedbackSchema.index({ presentationSessionId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
