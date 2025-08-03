const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB:", mongoose.connection.name))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.get('/', (req, res) => {
  res.send('MongoDB Atlas Connected!');
});

app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 🧠 Chat routes
app.use('/chats', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
