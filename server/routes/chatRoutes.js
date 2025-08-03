const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { getGeminiResponse } = require('../utils/gemini');

// ➕ Create a new chat (manual without AI)
router.post('/chats', async (req, res) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🧠 Ask AI (Gemini) and store chat
router.post('/ask', async (req, res) => {
  const { userId, chatId, prompt } = req.body;

  if (!prompt || !userId) {
    return res.status(400).json({ error: 'Prompt and userId are required' });
  }

  try {
    // 🔁 Generate AI response from Gemini
    const aiReply = await getGeminiResponse(prompt);

    let chat;

    if (chatId) {
      // ➕ Append to existing chat
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      chat.messages.push({ role: 'user', content: prompt });
      chat.messages.push({ role: 'assistant', content: aiReply });
      await chat.save();
    } else {
      // 🆕 Create new chat with first message
      chat = await Chat.create({
        userId,
        title: prompt.slice(0, 20) + '...',
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: aiReply }
        ]
      });
    }

    res.json(chat);
  } catch (err) {
    console.error('❌ Gemini Error:', err.message);
    res.status(500).json({ error: 'Failed to process Gemini response' });
  }
});

// 📄 Get all chats of a user
router.get('/user/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧾 Get a single chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Delete a chat
router.delete('/:id', async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
