const mongoose = require('mongoose');

// Events posted by admin. status drives the Upcoming / Ongoing / Completed tabs.
// maxSeats null = unlimited registrations; otherwise RSVPs are capped.
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    edition: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    venue: { type: String, default: '' },
    timeLabel: { type: String, default: '' },
    eventDate: { type: Date, default: null },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
    maxSeats: { type: Number, default: null, min: 1 },
    imageUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, order: 1 });

module.exports = mongoose.model('Event', eventSchema);
