const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const router = Router();

//../user/list
router.get("/list", async (req, res) => {
  const { token } = req.body;
  try {
    const users = await User.find({}, { password: false, __v: false });

    if (!users) {
      return res.status(400).json({ message: "Пользователи не найдены" });
    }

    jwt.verify(token, config.get("secret-key"), (err, decode) => {
      if (err) {
        console.log("не получилось расшифровать");
      }
    });

    return res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

//../user/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const candidate = await User.findOne({ _id: id });

    if (!candidate) {
      return res.status(400).json({ message: "Такой пользователь не найден" });
    }

    await User.remove({ _id: id });

    return res.status(200).json({ message: "Пользователь удален" });
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

module.exports = router;
