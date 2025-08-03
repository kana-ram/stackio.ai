import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { getAIResponse } from '../services/aiService.js';

export const createChat = async (req, res) => {
  try {
    const newChat = new Chat({ userId: req.userId });
    const savedChat = await newChat.save();

    // Add chatId to user
    await User.findByIdAndUpdate(req.userId, {
      $push: { chatIds: savedChat._id }
    });

    res.status(201).json(savedChat);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to create chat' });
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to get chat' });
  }
};

export const sendMessage = async (req, res) => {
  const { content } = req.body;
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });

    // Add user message
    chat.messages.push({ role: 'user', content });

    // Call AI and get response
    const aiReply = await getAIResponse([...chat.messages]); // Can customize prompt format
    chat.messages.push({ role: 'ai', content: aiReply });

    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to send message' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });

    await User.findByIdAndUpdate(req.userId, {
      $pull: { chatIds: req.params.id }
    });

    res.json({ msg: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete chat' });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).select('_id title createdAt');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch chat list' });
  }
};
