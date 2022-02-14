var express = require('express');
var router = express.Router();
const db = require('../db/database')
let add_minutes = require('../lib/add_minutes');

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

    let email = req.body.email;
    console.log(email);
    try {
        let bookingqrcode_sql = `select prefix,firstname,lastname,booking_code,booking_table.TIMESTAMP from users_table inner join booking_table on users_table.id = booking_table.users_table_id where email = '${email}' and booking_status ='รอการเข้าจอด';`;

        let bookingdetails = await db.query(bookingqrcode_sql);

        if (bookingdetails.length > 0) {

            let bookingtime = bookingdetails[0].TIMESTAMP;
            let expirationtime = add_minutes(bookingdetails[0].TIMESTAMP, 90);
        //    res.send(bookingdetails);
            res.status(200).json({
                'prefix': bookingdetails[0].prefix,
                'firstname': bookingdetails[0].firstname,
                'lastname': bookingdetails[0].lastname,
                'booking_code': bookingdetails[0].booking_code,
                'bookingtime': bookingtime,
                'expirationtime': expirationtime
            });
        } else {
            res.status(401).json({ message: 'no reservation', status: '401' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, status: '500' });
    }
});



module.exports = router;
