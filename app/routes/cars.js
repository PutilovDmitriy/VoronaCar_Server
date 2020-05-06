const { Router } = require("express");
const config = require("config");
const { check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const multer = require("multer");
const uuidv4 = require("uuid").v4;
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

      const today = new Date(new Date().getTime() + 18000000);

      const car = new Car({
        number: number.toUpperCase(),
        model,
        lastService: today,
        isRepairing: false,
        comments: "",
        info: info,
      });

      const send = await car.save();

      fs.mkdir(`./public/${send.number}`, () => {
        return res.status(201).json(send);
      });
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
        {
          lastService: today,
          problems,
          comments: comments || "",
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
      res.status(500).json({ message: "Что то пошло не так" });
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

    rimraf(`public/${userId}/${_id}`, () => console.log("Папка удалена"));
    return res.status(200).json({ message: "Авто удалено удален" });
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

//upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./public/${req.params.number}`;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileName = String(new Date()).toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

clearDir = async (req, res, next) => {
  try {
    const dir = `./public/${req.params.number}`;

    const car = Car.findOne({ userId: req.headers.userid });
    fs.readdir(dir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        if (car.photos.length == 0) {
          car.photos.map((url) => {
            if (!url.includes(file)) {
              fs.unlink(path.join(dir, file), (err) => {
                if (err) throw err;
              });
            }
          });
        }
      }
    });
    next();
  } catch {
    return res.status(500).send("Что-то пошло не так");
  }
};

//../car/upload-images
router.post(
  "/upload/:number",
  clearDir,
  upload.array("file", 6),
  async (req, res) => {
    try {
      const number = req.params.number;
      console.log("tyt");
      const reqFiles = [];
      const url = "https://pacific-cliffs-72324.herokuapp.com/public";
      req.files.map((file) => {
        reqFiles.push(url + `/${number}/` + file.filename);
      });

      let car = Car.findOne({ number });

      car.photos = [...reqFiles, ...car.photos];

      await Car.update({ _id: car._id }, car);

      const send = Car.findOne({ _id: car._id });

      return res.status(200).send(send);
    } catch {
      return res.status(500).send("Что-то пошло не так");
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
