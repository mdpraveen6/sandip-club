const mongoose = require('mongoose');

// One row per started presentation (QR #2). Only one ACTIVE at a time.
const presentationSessionSchema = new mongoose.Schema(
  {
    presentingRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    teamNumber: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    expectedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

presentationSessionSchema.index({ status: 1, startedAt: -1 });
presentationSessionSchema.index({ teamNumber: 1, startedAt: -1 });

module.exports = mongoose.model('PresentationSession', presentationSessionSchema);
