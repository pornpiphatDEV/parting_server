
var express = require('express');
var router = express.Router();
let db = require('../db/database');

router.post('/', async (req, res) => {
    let qrcode = req.body.qrcode;

    console.log(qrcode);
    return res.status(200).json({
        status: 200,
        message: "scan in successfully",
    });

    // try {
    //     let chekeqrcode = await db.query(`select * from booking_table where booking_code = '${qrcode}';`);

    //     if (chekeqrcode.length === 0) {
    //         return res.status(401).json({
    //             status: 401,
    //             message: "no qrcode for this system.",
    //         });
    //     }

    //     let updatescanin = `update booking_table set booking_status = 'เข้าจอด' , timeincar = '${timenow()}' where id = ${chekeqrcode[0].id};`;
    //     db.query(updatescanin, (err, result) => {
    //         if (err) throw err;
    //         res.status(200).json(result);
    //     });
    // } catch (error) {
    //     console.log(error.message);
    //     res.status(500).json({ message: error.message, status: '500' });
    // }
});

module.exports = router;