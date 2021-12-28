var express = require('express');
var router = express.Router();
let db = require('../db/database');


router.get('/', function (req, res, next) {
    res.render('index', { title: 'parking' });
});


router.post('/', function (req, res, next) {
    let slotname = req.body.slotname;
    let slotstelus = req.body.slotstelus;
    console.log(req.body);
    try {
        let sqllogin = `UPDATE parkdata_tables set slotstelus = ${slotstelus} where (slotname = '${slotname}');`;
        db.query(sqllogin, (err, result) => {
            if (err) throw err;
            return res.json({
                status: 200,
                message: "add parking slotstelus successfully"
            });
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, status: '500' });
    }
});

module.exports = router;