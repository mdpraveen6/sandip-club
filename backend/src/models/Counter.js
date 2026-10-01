const mongoose = require('mongoose');

// Atomic sequence for server-ordered team numbers (QR #1).
// Usage: findOneAndUpdate({_id:'teamNumber'}, {$inc:{seq:1}}, {upsert:true, new:true})
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Counter', counterSchema);
