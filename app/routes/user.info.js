const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

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
