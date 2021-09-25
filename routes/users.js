var express = require('express');
var router = express.Router();
var md5 = require("md5");


let makeid = require('../lib/makeid');
let timenow = require('../lib/datetime');
let db = require('../db/database');
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


// สมัคสมาชิก
router.post('/register', async (req, res) => {
  try {
    console.log(req.body);
    let prefix = req.body.prefix;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = md5(req.body.password);
    let carregistration = req.body.carregistration;
    let cardNumber = req.body.cardNumber;
    let expiryDate = req.body.expiryDate;
    let cvvCode = req.body.cvvCode;
    let cardHolderName = req.body.cardHolderName;

    console.log(`select * from users_table where email = '${email}';`);
    const chekemail = await db.query(`select * from users_table where email = '${email}';`);
    
    console.log(chekemail);
    const chekcardNumber = await db.query(`select * from users_table where cardNumber = '${cardNumber}';`);

    if (chekemail.length > 0) {
      return res.json({
        status: 400,
        message: "email already exist"
      });
    }

    if (chekcardNumber.length > 0) {
      return res.json({
        status: 400,
        message: "cardNumber already exist"
      });
    }

    let sqllogin = `INSERT INTO users_table (prefix,firstname, lasname, email, password, carregistration, money,cardNumber,expiryDate,cvvCode,cardHolderName) VALUES ('${prefix}','${firstname}', '${lastname}','${email}', '${password}', '${carregistration}', ${20000},'${cardNumber}', '${expiryDate}','${cvvCode}','${cardHolderName}');`;
    db.query(sqllogin, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});
// สมัคสมาชิก

// เข้าสู่ระบบ
router.post("/login", async (req, res) => {
  console.log(req.body);
  let email = req.body.email;
  let password = md5(req.body.password);
  try {
    const chekemail = await db.query(`select * from users_table where email = '${email}' and password = '${password}';`);
    if (chekemail.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "Invalid username and password.",
      });
    }
    res.status(200).json({
      message: "You have succesfully loggedin.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});

router.post('/booking', async (req, res) => {
  let email = req.body.email;
  try {
    const chekemail = await db.query(`select * from users_table where email = '${email}';`);
    const bookinglimit = await db.query(`select * from limit_table`);
    const chekebooking = await db.query(`select booking_table.id,email,booking_code,booking_status  from users_table inner join booking_table on users_table.id = booking_table.users_table_id where email = '${email}' and booking_status = 'รอการเข้าจอด';`);

    console.log(chekebooking);
    if (chekemail.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "no email for this system.",
      });
    }

    if (bookinglimit[0].limitbooking <= 0) {
      return res.status(401).json({
        status: 401,
        message: "booking limit for this system.",
      });
    }

    if (chekebooking.length > 0) {
      return res.status(401).json({
        status: 401,
        message: "has already been reserved in the system.",
      });
    }

    let qrcode = makeid(10);
    let user_id = chekemail[0].id;
    console.log(timenow());

    let insertbooking = `insert into booking_table(booking_code,booking_status,TIMESTAMP,users_table_id) values('${qrcode}' ,'รอการเข้าจอด','${timenow()}',${user_id});`;
    db.query(insertbooking, (err, result) => {
      if (err) throw err;
      db.query(`update limit_table set limitbooking = limitbooking-1 where id=1;`, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
      });
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});
// เข้าสู่ระบบ


// สแกนเข้า
router.post('/scanin', async (req, res) => {
  let qrcode = req.body.qrcode;
  try {
    let chekeqrcode = await db.query(`select * from booking_table where booking_code = '${qrcode}';`);
    if (chekeqrcode.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "no qrcode for this system.",
      });
    }

    let updatescanin = `update booking_table set booking_status = 'เข้าจอด' , timeincar = '${timenow()}' where id = ${chekeqrcode[0].id};`;
    db.query(updatescanin, (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});
// สแกนเข้า



// chekbill
router.post('/chekbill', async (req, res) => {
  let chekcode = req.body.chekcode;
  let bookingcode = req.body.bookingcode;
  try {
    if (chekcode !== "chekbillbooking") {
      return res.status(401).json({
        status: 401,
        message: "no chekcode for this system.",
      });
    }

    let chekbillbooking = await db.query(`select booking_table.id,prefix,firstname,lasname,email,booking_code,booking_status,timeincar from users_table inner join booking_table on users_table.id = booking_table.users_table_id where booking_code = '${bookingcode}' and booking_status='เข้าจอด';`);
    if (chekbillbooking.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "not yet parked .",
      });
    }

    console.log(chekbillbooking);
    console.log(timein(chekbillbooking[0].timeincar));
    console.log(`SELECT  now() as timeoutcar ,TIMESTAMPDIFF(hour,'${timein(chekbillbooking[0].timeincar)}', now()) as hourincar;`);
    let overtime = await db.query(`SELECT  now() as timeoutcar ,TIMESTAMPDIFF(hour,'${timein(chekbillbooking[0].timeincar)}', now()) as hourincar;`);
    let bookingid = chekbillbooking[0].id;
    let prefix = chekbillbooking[0].prefix;
    let firstname = chekbillbooking[0].firstname;
    let lasname = chekbillbooking[0].lasname;
    let email = chekbillbooking[0].email;
    let booking_code = chekbillbooking[0].booking_code;
    let booking_status = chekbillbooking[0].booking_status;
    let timeincar = timein(chekbillbooking[0].timeincar);
    let timeoutcar = timein(overtime[0].timeoutcar);
    let hourincar = overtime[0].hourincar;
    let money = moneyfunction(hourincar);

    res.status(200).json({
      "bookingid": bookingid,
      "prefix": prefix,
      "firstname": firstname,
      "lastname": lasname,
      "email": email,
      "booking_code": booking_code,
      "timeincar": timeincar,
      "timeoutcar": timeoutcar,
      "hourincar": hourincar,
      "money": money
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});
// chekbill

router.post('/pay', async (req, res) => {
  let bookingid = req.body.bookingid;
  let prefix = req.body.prefix;
  let firstname = req.body.firstname;
  let lasname = req.body.lasname;
  let email = req.body.email;
  let booking_code = req.body.booking_code;
  let timeincar = req.body.timeincar;
  let timeoutcar = req.body.timeoutcar;
  let hourincar= req.body.hourincar;
  let money = req.body.money;

  console.log(req.body);
  let chekpay = await  db.query(`select * from booking_table where booking_status = 'เข้าจอด' and booking_code = '${booking_code}';`);
  if (chekpay.length === 0) {
    return res.status(401).json({
      status: 401,
      message: "no booking_code for this system.",
    });
  }
  let moneyuser = await db.query(`select money from users_table where email = '${email}'`);
  if (moneyuser[0].money < money) {
    return res.status(401).json({
      status: 401,
      message: "Not only your balance.",
    });
  }
  db.query(`update users_table set money = money - ${money} where email = '${email}';`,async (err, result) => {
    if (err) throw err;
    console.log(`update booking_table set booking_status = 'สำเร็จ' ,  timeoutcar = '${timeoutcar}' where id = ${bookingid};`);
    let updatebooking = await db.query(`update booking_table set booking_status = 'สำเร็จ' ,  timeoutcar = '${timeoutcar}' where id = ${bookingid};`);
    let insertbill = await db.query(`insert into bill_table(hourincar,bookingservice,servicecharge,booking_table_id) values(${hourincar} , 20 , ${money} ,${bookingid} );`);
    let uplimit = await db.query(`update limit_table set limitbooking = limitbooking+1 where id=1;`,);
    
    return res.status(200).json({
      status: 200,
      message: "successful payment.",
    });
  });
});






let timein = (timenow) => {
  var dateObj = new Date(timenow);
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  var hours = dateObj.getUTCHours();
  var minutes = dateObj.getUTCMinutes();
  var seconds = dateObj.getUTCSeconds();
  var newdate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  return newdate;
}


let moneyfunction = (hourincar) => {
  if (hourincar <= 0) {
    return 20;
  } else {
    return hourincar * 20;
  }
};


module.exports = router;