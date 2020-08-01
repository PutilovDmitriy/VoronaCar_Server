const { Router } = require("express");
const router = Router();
const { check, validationResult } = require("express-validator");
const fetch = require("node-fetch");
const Bot = require("../models/Bot");

router.get("/info", async (req, res) => {
  try {
    const bot = await Bot.find();

    if (!bot) {
      res.status(404).json({ message: "Сообщения отсутствуют" });
    }

    const chats = [];

    bot.map((message) => {
      console.log(message);
      const idx = chats.findIndex((ch) => ch.id === message.chatId);
      if (idx >= 0) {
        console.log(idx);
        chats[idx].messages.push(message);
      } else {
        const newChat = { id: message.chatId, messages: [message] };
        console.log(newChat);
        chats.push(newChat);
      }
    });

    return res.status(200).json(chats);
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

router.post(
  "/send",
  [
    check("id", "id сообщения отсутствует").exists(),
    check("chatId", "Номер чата отсутствует").exists(),
    check("message", "Отсутствует сообщение").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные для ответа",
      });
    }
    try {
      const { id, chatId, message } = req.body;

      const bot = await Bot.findOne({ _id: id });

      if (!bot) {
        res.status(404).send("Нет сообщения на которое нужно ответить");
      }

      const result = await fetch(
        `https://api.telegram.org/bot${process.env.TOKEN}/sendMessage?chat_id=${chatId}&text=${message}`
      );

      if (result.status === 200) {
        await Bot.remove({ _id: bot._id });
        return res.status(200).send("Сообщение отправлено");
      }
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

router.post("/add", async (req, res) => {
  try {
    const { chatId, message } = req.body;

    console.log(chatId);

    const bot = new Bot({
      chatId,
      message,
    });

    await bot.save();

    return res.status(200).send("Save");
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const message = await Bot.findOne({ _id: id });

    if (!message) {
      return res.status(400).json({ message: "Такое сообщение не найдено" });
    }

    await Bot.remove({ _id: message._id });

    return res.status(200).json({ message: "Сообщение удалено" });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

module.exports = router;