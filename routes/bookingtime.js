var express = require('express');
var router = express.Router();
const db = require('../db/database')
let add_minutes = require('../lib/add_minutes');
let qrcodeexpirationtime = require('../lib/expirationtime');
router.get('/bookinglimit', function (req, res, next) {
    try {
        let bookinglimit = `SELECT * FROM parkingdb.limit_table;`;
        db.query(bookinglimit, (err, result) => {
            if (err) throw err;
            return res.send(
                result
            );
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, status: '500' });
    }
});

router.post('/bookingqrcode', async function (req, res, next) {

    let userid = req.body.userid;
    console.log(userid);
    try {

        let bookingqrcode_sql = `select * from booking_table where users_table_id = ${userid}  and booking_status = 'รอการเข้าจอด';`;
        let bookingqrcode_sql2 = `select * from booking_table where users_table_id = ${userid}  and booking_status = 'เข้าจอด';`;
        let bookingdetails = await db.query(bookingqrcode_sql);
        let bookingdetails2 = await db.query(bookingqrcode_sql2);

        if (bookingdetails2.length > 0) {
            res.status(401).json({ message: 'no reservation', status: '401' });
        }


        if (bookingdetails.length > 0) {
            let id = bookingdetails[0].id;
            let bookingtime = bookingdetails[0].TIMESTAMP;
            let expirationtime = add_minutes(bookingdetails[0].TIMESTAMP, 3);
            console.log(expirationtime);
            let qrcode_expirationtime = qrcodeexpirationtime(expirationtime);
            console.log(qrcode_expirationtime);


            if (qrcode_expirationtime) {
                res.status(200).json({
                    'qrcodeid': id,
                    'booking_code': bookingdetails[0].booking_code,
                    'bookingtime': bookingtime,
                    'expirationtime': expirationtime
                });
            } else {


                let updateqrcodeexpired = await db.query(`update booking_table set booking_status = 'หมดอายุการใช้งาน' where id=${id};`);
                res.status(403).json(
                    { message: 'This qrcode has expired.', status: '403' }
                );


            }


        } else {
            res.status(401).json({ message: 'no reservation', status: '401' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, status: '500' });
    }
});



module.exports = router;
