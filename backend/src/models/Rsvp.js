const mongoose = require('mongoose');

// One RSVP per (event, email). Counted against Event.maxSeats.
const rsvpSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

rsvpSchema.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Rsvp', rsvpSchema);
