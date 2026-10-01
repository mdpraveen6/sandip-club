const mongoose = require('mongoose');

// One row per Register-form submission (SUN Launchpad idea applications).
// Flow: pending -> accepted (passRef issued + approval email) -> addedToTeam (via Team tab).
const registrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    prn: { type: String, required: true, trim: true },
    school: { type: String, default: '' },
    academicYear: { type: String, default: '' },
    gender: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    ideaTitle: { type: String, required: true, trim: true },
    domain: { type: String, default: '' },
    teamType: { type: String, default: 'Solo Founder' },
    problemStatement: { type: String, required: true },
    solutionOverview: { type: String, required: true },
    pitchDeckUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'shortlisted', 'rejected', 'accepted'], default: 'pending' },
    notes: { type: String, default: '' },
    passRef: { type: String, default: '' },
    acceptedAt: { type: Date, default: null },
    addedToTeam: { type: Boolean, default: false },
    // Event check-in (QR #1): official team number assigned by server order.
    teamNumber: { type: Number, default: null },
    checkedInAt: { type: Date, default: null },
    checkinStatus: { type: String, enum: ['pending', 'checked-in'], default: 'pending' },
  },
  { timestamps: true }
);

registrationSchema.index({ email: 1, createdAt: -1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ teamNumber: 1 }, { unique: true, sparse: true });
registrationSchema.index({ status: 1, teamNumber: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
