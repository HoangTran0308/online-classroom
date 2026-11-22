const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['pdf', 'video', 'reading'], required: true },
    url: { type: String, default: '' },     // link video hoặc đường dẫn file đã upload
    content: { type: String, default: '' }, // nội dung bài đọc
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);