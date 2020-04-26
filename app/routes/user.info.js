const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const router = Router();

//../user/list
router.get("/list", async (req, res) => {
  const token = req.headers.token;

  try {
    const users = await User.find({}, { password: false, __v: false });

    if (!users) {
      return res.status(400).json({ message: "Пользователи не найдены" });
    }

    await jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Пользователь не верифицирован" });
      }
    });

    const send = users.filter((user) => user.login !== "5245984202");

    return res.status(200).json(send);
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

//../user/update
router.put("/update", async (req, res) => {
  try {
    const { user } = req.body;

    const candidate = await User.find({ _id: user._id });

    if (!candidate) {
      return res.status(400).json({ message: "Пользователи не найдены" });
    }

    console.log(user);

    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, 15);
      user.password = hashedPassword;
    }

    await User.updateOne({ _id: user._id }, user);

    const send = await User.findOne(
      { _id: user._id },
      { password: false, __v: false }
    );

    return res.status(200).json(send);
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
