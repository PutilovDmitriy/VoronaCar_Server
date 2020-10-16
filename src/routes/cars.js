const { Router } = require("express");
const ExcelJs = require('exceljs');
const tempfile = require('tempfile');
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
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

//../car/create
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
      const { number, model, info } = req.body;

      const auto = await Car.findOne({ number });

      if (auto) {
        return res.status(400).json({ message: "Такой авто уже существует" });
      }

      const today = newDate();

      const car = new Car({
        number: number.toUpperCase(),
        model,
        lastService: today,
        isRepairing: false,
        comments: "",
        info: info,
      });

      const send = await car.save();

      return res.status(201).json(send);
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
      const { number, problems, comments, isWashed } = req.body;

      const auto = await Car.findOne({ number });

      if (!auto) {
        return res.status(400).json({ message: "Авто не найдено" });
      }

      const today = newDate();

      let lastWashDate;
      if (isWashed) {
        lastWashDate = new Date(new Date().getTime() + 18000000);
      }

      await Car.updateOne(
        { _id: auto._id },
        {
          lastService: today,
          problems,
          comments: comments || "",
          lastWashDate,
        }
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
      res.status(500).json({ message: "Что-то пошло не так" });
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
      const { number, info, comments } = req.body;

      const auto = await Car.findOne({ number });

      if (!auto) {
        return res.status(400).json({ message: "Авто не найдено" });
      }

      const updateInfo = () => {
        let newInfo = {};
        for (let key in info) {
          newInfo[`info.${key}`] = info[key];
        }
        return newInfo;
      };

      await Car.updateOne(
        { _id: auto._id },
        {
          comments,
          $set: updateInfo(),
        }
      );

      const car = await Car.findOne({ _id: auto._id });

      return res.status(200).json(car);
    } catch (e) {
      res.status(500).json({ message: "Что-то пошло не так" });
    }
  }
);

//../car/:number
router.delete("/:number", async (req, res) => {
  try {
    const number = req.params.number;

    const candidate = await Car.findOne({ number });

    if (!candidate) {
      return res.status(400).json({ message: "Такая машина не найдена" });
    }

    await Car.remove({ _id: candidate._id });

    return res.status(200).json({ message: "Авто удалено удален" });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

//..car/add-events
router.post("/add-events", async (req, res) => {
  try {
    const { number, events } = req.body;

    const candidate = await Car.findOne({ number });
    if (!candidate) {
      return res.status(400).json({ message: "Такая машина не найдена" });
    }
    const newEvents = events.map(event => ({ date: new Date(event.date), text: event.text }))
    candidate.events.push(...newEvents);
    await Car.update({ _id: candidate._id }, { events: candidate.events });

    return res.status(200).json({ message: 'События добавлены' });
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

//..car/events
router.get("/events/:number", async (req, res) => {
  try {
    const {number} = req.params;

    const car = await Car.findOne({number});
    if (!car) {
      return res.status(400).json({message: "Такая машина не найдена"});
    }
    if (!car.events || car.events.length === 0) {
      return res.status(400).json({message: "У авто нет доступных событий"});
    }

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet(`События по ${car.number}`);

    worksheet.columns = [
      {header: '№', key: 'id', width: 10},
      {header: 'Дата', key: 'date', width: 32},
      {header: 'Событие', key: 'event', width: 150}
    ];
    car.events.forEach((event, index) => {
      worksheet.addRow({id: index + 1, date: new Intl.DateTimeFormat('ru').format(new Date(event.date)), event: event.text });
    })

    const tempFilePath = tempfile('.xlsx');
    await workbook.xlsx.writeFile(tempFilePath)
    return res.sendFile(tempFilePath);
  } catch {
    res.status(500).json({ message: "Что-то пошло не так" });
  }
});

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
