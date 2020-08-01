const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

//../auth/register
router.post(
  "/register",
  [
    check("login", "Некорректный login").isLength({ min: 10 }),
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

      const send = await User.findOne({ login });

      return res.status(201).json(send);
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
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

      const token = jwt.sign(
        { userId: user.id, name: user.name, login: user.login },
        process.env.SECRET_KEY,
        {
          expiresIn: "100h",
        }
      );

      res.json({ token, userId: user.id, name: user.name, login: user.login });
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

//../auth/login/admin
router.post(
  "/login/admin",
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

      if (login !== "5245984202") {
        return res
          .status(400)
          .json({ message: "Воспользуйтесь аккаунтом администратора" });
      }

      const user = await User.findOne({ login });

      if (!user) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Логин или пароль не верны" });
      }

      const token = jwt.sign({}, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

module.exports = router;
