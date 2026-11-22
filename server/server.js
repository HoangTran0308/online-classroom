require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('./models/User');
require('./models/Course');
require('./models/Enrollment');
require('./models/Assignment');
require('./models/Material');
require('./models/Submission');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
  })
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));