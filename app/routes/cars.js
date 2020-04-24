const { Router } = require("express");
const config = require("config");
const { check, validationResult } = require("express-validator");
const Car = require("../models/Car");
const Vorona = require("../models/Vorona");
const router = Router();

//../car/info
router.get("/info", async (req, res) => {
  try {
    const cars = await Car.find();

    if (!cars) {
      return res.status(400).json({ message: "Автомобили не найдены" });
    }

    return res.status(200).json(cars);
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

//../car/add
router.post(
  "/create",
  [
    check("number", "Неверно указан гос номер").isLength({ min: 6 }),
    check("model", "Модель отсутствует").exists(),
    check("info", "Отсутсвует информация об авто").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при добавлении смены",
      });
    }
    try {
      const { number, model } = req.body;

      const auto = await Car.findOne({ number });

      if (auto) {
        return res.status(400).json({ message: "Такой авто уже существует" });
      }

      const today = new Date(new Date().getTime() + 18000000);

      const car = new Car({
        number: number.toUpperCase(),
        model,
        lastService: today,
        isRepairing: false,
        comments: "",
        info: info,
      });

      await car.save();

      return res.status(201).json({ message: "Авто добавленно" });
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

//../car/services
router.put(
  "/services",
  [
    check("number", "Неверно указан гос номер").isLength({ min: 6 }),
    check("problems", "Неверный формат проблем").isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при добавлении смены",
      });
    }

    try {
      const { number, problems, comments } = req.body;

      const auto = await Car.findOne({ number });

      if (!auto) {
        return res.status(400).json({ message: "Авто не найдено" });
      }

      const today = new Date(new Date().getTime() + 18000000);

      await Car.updateOne(
        { _id: auto._id },
        { lastService: today, problems, comments: comments || "" }
      );

      const car = await Car.findOne(
        { _id: auto._id },
        { info: false, _v: false }
      );

      return res.status(200).json({
        message: "Данные об обслуживании успешно добавлены",
        info: car,
      });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

//../car/update
router.put(
  "/update",
  [
    check("number", "Отсутсвует номер авто").exists(),
    check("info", "Данные").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Некорректные данные при обновлении информации",
      });
    }

    try {
      const { number, info } = req.body;

      const auto = await Car.findOne({ number });

      if (!auto) {
        return res.status(400).json({ message: "Авто не найдено" });
      }

      await Car.updateOne(
        { _id: auto._id },
        {
          $set: info,
        }
      );

      const car = await Car.findOne({ _id: auto._id });

      return res.status(200).json({
        message: "Данные об обслуживании успешно добавлены",
        car: car,
      });
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

//..car/vorona
router.get("/vorona", async (req, res) => {
  try {
    const vorona = await Vorona.findOne({ _id: config.get("voronaId") });

    if (!vorona) {
      return res.status(400).json({ message: "Автомобиль не найдены" });
    }

    return res.status(200).json(vorona.valueOil);
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

//..car/vorona/minus
router.put(
  "/vorona/minus",
  [check("value", "Отсутствуют данные о топливе").exists()],
  async (req, res) => {
    try {
      const { value } = req.body;

      const vorona = await Vorona.findOne({ _id: config.get("voronaId") });

      if (!vorona) {
        return res.status(400).json({ message: "Автомобиль не найдены" });
      }

      const valueOil = Number(vorona.valueOil) - Number(value);

      const newVorona = new Vorona({
        _id: config.get("voronaId"),
        valueOil: valueOil,
      });

      await newVorona.replaceOne(newVorona);

      return res.status(200).json({ message: "Заправка учтена" });
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

//../car/vorona/plus
router.put(
  "/vorona/plus",
  [check("value", "Отсутствуют данные о топливе").exists()],
  async (req, res) => {
    try {
      const { value } = req.body;

      const vorona = await Vorona.findOne({ _id: config.get("voronaId") });

      if (!vorona) {
        return res.status(400).json({ message: "Автомобиль не найдены" });
      }

      const valueOil = Number(vorona.valueOil) + Number(value);

      const newVorona = new Vorona({
        _id: config.get("voronaId"),
        valueOil: valueOil,
      });

      await newVorona.replaceOne(newVorona);

      return res.status(200).json({ message: "Заправлено" });
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

module.exports = router;
