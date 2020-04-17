const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

//../auth/register
router.post(
  "/register",
  [
    check("login", "Некорректный login").isLength({ min: 1 }),
    check("password", "Минимальная длинна пароля 6").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при регистрации",
      });
    }

    try {
      const { login, password, name } = req.body;

      const candidate = await User.findOne({ login });

      if (candidate) {
        return res.status(400).json({ message: "Такой пользователь уже есть" });
      }

      const hashedPassword = await bcrypt.hash(password, 15);

      const user = new User({ login, password: hashedPassword, name });

      await user.save();

      return res.status(201).json({ message: "Пользователь создан" });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

//../auth/login
router.post(
  "/login",
  [
    check("login", "Некорректный login").isLength({ min: 10 }),
    check("password", "Минимальная длинна пароля 6").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при входе в систему",
      });
    }

    try {
      const { login, password } = req.body;

      const user = await User.findOne({ login });

      if (!user) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Логин или пароль не верны" });
      }

      const token = jwt.sign({ userId: user.id }, config.get("secret-key"), {
        expiresIn: "1h",
      });

      res.json({ token, userId: user.id, name: user.name });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

module.exports = router;
