const { Router } = require("express");
const ExcelJs = require('exceljs');
const tempfile = require('tempfile');
const ServiceRecord = require('../models/ServiceRecord');
const router = Router();

//..service-record/
router.get(
    "/",
    async (req, res) => {
        try {
            const { start, end, number } = req.query;

            if (!start || !end) {
                return res.status(404).send('Укажите даты')
            }
            const params = {
                date: {
                    $gte: new Date(start.slice(0, 16)),
                    $lte: new Date(end.slice(0, 16))
                }
            };
            if (number) {
                params.number = number.toUpperCase();
            }
            const serviceRecords = await ServiceRecord.find(params);
            if (!serviceRecords || serviceRecords.length === 0) {
                return res.status(404).send('Не найдено ни одной записи')
            }

            const workbook = new ExcelJs.Workbook();
            const worksheet = workbook.addWorksheet('Записи об обслуживании');

            worksheet.columns = [
                {header: '№', key: 'id', width: 10},
                {header: 'Дата', key: 'date', width: 32},
                {header: 'Номер ТС', key: 'number', width: 20, height: 2},
                {header: 'Заправлено на АЗС', key: 'fromGS', width: 20},
                {header: 'Мойка (руб)', key: 'wash', width: 15},

            ];
            worksheet.getRow(1).font = { bold: true };
            const optionsDate = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            serviceRecords.forEach((record, index) => {
                worksheet.addRow(
                    {
                            id: index + 1,
                            date: new Intl.DateTimeFormat('ru', optionsDate).format(new Date(record.date)),
                            number: record.number,
                            fromGS: record.fromGS ? 'Да' : '',
                            wash: record.wash
                        }
                    );
            });

            const tempFilePath = tempfile('.xlsx');
            await workbook.xlsx.writeFile(tempFilePath);
            return res.status(200).sendFile(tempFilePath);
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так" });
        }
    }
);

module.exports = router;
