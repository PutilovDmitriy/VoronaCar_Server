const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

//../user/add-work-shift
// router.put(
//   "/add-work-shift",
//   [
//     check("userId", "Отсутствует Id").exists(),
//     check("dateStart", "Отсутствует дата начала").exists(),
//     check("dateEnd", "Отстутствует дата окончания").exists(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errors: errors.array(),
//         message: "Некорректные данные при добавлении смены",
//       });
//     }

//     try {
//       const { userId, dateStart, dateEnd } = req.body;

//       const candidate = await User.findOne({ _id: userId });

//       if (!candidate) {
//         return res
//           .status(400)
//           .json({ message: "Такой пользователь не найден" });
//       }

//       const dateS = new Date(dateStart);
//       const dateE = new Date(dateEnd);

//       let s = (dateE - dateS) / 1000 / 60;
//       let m = s % 60;
//       let h = (s - m) / 60;

//       const user = new User({
//         _id: candidate._id,
//         login: candidate.login,
//         password: candidate.password,
//         name: candidate.name,
//         workShift: [
//           ...candidate.workShift,
//           { date: dateS.toISOString(), quantityTime: `${h}:${m}` },
//         ],
//       });

//       await user.replaceOne(user);

//       return res.status(202).json({ message: "Данные о смене добавлены" });
//     } catch (e) {
//       res.status(500).json({ message: "Что то пошло не так" });
//     }
//   }
// );

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
