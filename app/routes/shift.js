const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Shift = require("../models/Shift");
const router = Router();

//../shift/start
router.post(
  "/start",
  [check("userId", "Отсутствует Id").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при добавлении смены",
      });
    }

    try {
      const { userId } = req.body;

      const candidate = await User.findOne({ _id: userId });

      if (!candidate) {
        return res
          .status(400)
          .json({ message: "Такой пользователь не найден" });
      }

      const today = new Date(new Date().getTime() + 18000000);

      const shift = new Shift({
        userId: candidate._id,
        shiftStart: today,
        shiftTime: 0,
        valueOil: 0,
        wash: 0,
        isFinished: false,
      });

      const log = await shift.save();

      return res.status(202).json({ message: "Смена создана", id: log._id });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

//../shift/update
router.put(
  "/update",
  [
    check("shiftId", "Отсутствует Id").exists(),
    check("carNumber", "Машина отсутствует").exists(),
    check("value", "Отсутсвует колличество литров").exists(),
    check("money", "Данные об оплане отсутствуют").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при обновлении смены",
      });
    }

    try {
      const { shiftId, carNumber, value, money } = req.body;

      const shiftS = await Shift.findOne({ _id: shiftId });

      if (!shiftS) {
        return res.status(400).json({ message: "Такая смена не найдена" });
      }

      const valueOil = Number(shiftS.valueOil) + Number(value);
      const wash = Number(shiftS.wash) + Number(money);
      const carsList = [...shiftS.carsList, carNumber];

      await Shift.updateOne({ _id: shiftS._id }, { valueOil, wash, carsList });

      return res.status(202).json({ message: "Данные о смене обновлены" });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

//../shift/finish
router.put(
  "/finish",
  [check("shiftId", "Отсутствует Id").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при добавлении смены",
      });
    }

    try {
      const { shiftId } = req.body;

      const shiftS = await Shift.findOne({ _id: shiftId });

      if (!shiftS) {
        return res.status(400).json({ message: "Такая смена не найдена" });
      }

      const dateS = new Date(shiftS.shiftStart);
      const today = new Date(new Date().getTime() + 18000000);

      const m = (today - dateS) / 1000 / 60;

      await Shift.updateOne(
        { _id: shiftS._id },
        { shiftStart: dateS, shiftTime: m, isFinished: true }
      );

      return res.status(202).json({ message: "Данные о смене обновлены" });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

//../shift/list
router.get("/list/:id", async (req, res) => {
  try {
    const id = req;

    console.log(req.params.id);

    const user = await User.findOne({ id });

    if (!user) {
      return res.status(400).json({ message: "Такой пользователь не найден" });
    }

    const shifts = await Shift.find({ userId: userId });

    return res.status(200).json({ shifts });
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

module.exports = router;
