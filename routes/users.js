var express = require('express');
var router = express.Router();
var md5 = require("md5");


let makeid = require('../lib/makeid');
let timenow = require('../lib/datetime');
let db = require('../db/database');


router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});



router.get('/userId', async (req, res, next) => {
  try {
    let userId = JSON.stringify(req.headers.userid);
    console.log(userId);
    const user = await db.query(`select prefix, firstname ,lastname,email,money,status_agreement from users_table where id = ${userId}`);
    if (user.length > 0) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({
        status: 401,
        message: "users already exist"
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});



router.get('/usagehistory', async (req, res, next) => {
  try {
    let userId = JSON.stringify(req.headers.userid);
    console.log(userId);
    const user = await db.query(`select timeincar,timeoutcar,hourincar,servicecharge from booking_table inner join bill_table  on booking_table.id = bill_table.booking_table_id where users_table_id = ${userId} ORDER BY booking_table.id DESC;`);
    if (user.length > 0) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({
        status: 401,
        message: "users already exist"
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});



router.get('/parkinghistory', async (req, res, next) => {
  try {
    let userId = JSON.stringify(req.headers.userid);
    console.log(userId);
    const user = await db.query(`select booking_status , timeincar , timeoutcar from booking_table where users_table_id = ${userId}  ORDER BY booking_table.id DESC;`);
    if (user.length > 0) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({
        status: 401,
        message: "users already exist"
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
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

    console.log(`select * from users_table where email = '${email}';`);
    const chekemail = await db.query(`select * from users_table where email = '${email}';`);

    if (chekemail.length > 0) {
      return res.status(401).json({
        status: 401,
        message: "email already exist"
      });
    }

    let sqllogin = `INSERT INTO users_table (prefix,firstname,lastname,email,password, money, status_agreement) VALUES ('${prefix}', '${firstname}', '${lastname}', '${email}', '${password}', '20000', '0');`;
    db.query(sqllogin, (err, result) => {
      if (err) throw err;
      console.log(result);
      // res.status(201).json(result);
      db.query(`select * from users_table where email = '${email}';`, (err, result) => {
        if (err) throw err;
        res.status(201).json(result);
      });
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
    const chekuser = await db.query(`select * from users_table where email = '${email}' and password = '${password}';`);
    if (chekuser.length === 0) {
      return res.status(403).json({
        status: 403,
        message: "Invalid username and password.",
      });
    }
    if (chekuser[0].status_agreement === 0) {
      return res.status(401).json(chekuser);
    }
    else {
      return res.status(200).json(chekuser);
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});


// ยืนยันตัวตน 
router.post('/confirmat', async (req, res) => {


  console.log(req.body);

  let cardNumber = req.body.cardNumber;
  let expiryDate = req.body.expiryDate;
  let cardHolderName = req.body.cardHolderName;
  let cvvCode = req.body.cvvCode;

  let brandcar = req.body.brandcar;
  let carregistration = req.body.carregistration;
  let carpaint = req.body.carpaint;
  let uid = req.body.uid;


  try {

    const chekcardNumber = await db.query(`select * from creditcard_table where cardNumber = '${cardNumber}'; `);
    if (chekcardNumber.length > 0) {
      return res.status(403).json({
        status: 403,
        message: "chekcardNumber already exist"
      });
    }
    else {

      const insertusercar = await db.query(`insert into userscar_table(car_carregistration,car_bran,car_colar,users_table_id)value('${carregistration}','${brandcar}','${carpaint}','${uid}');`);
      const insertusercacreditcard = await db.query(`insert into creditcard_table(cardNumber,expiryDate,cvvCode,cardHolderName,users_table_id)value('${cardNumber}','${expiryDate}','${cvvCode}','${cardHolderName}','${uid}');`);
      const updatestatus_agreement = await db.query(`update users_table set status_agreement = 1 where id=${uid};`);

      res.status(200).json({
        message: "You have succesfully loggedin.",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});






router.post('/repassword', async (req, res) => {


  console.log(req.body);


  let userid = req.body.userid;
  let password = md5(req.body.password);
  console.log(userid);
  console.log(password);
  try {
    let user = await db.query(`select * from users_table where id = ${userid} and password = '${password}';`);

    if (user.length > 0) {
      return res.status(401).json({
        status: 401,
        message: "password already exist"
      });
    }


    let updatepassword = await db.query(`update users_table set password = '${password}' where	id = ${userid};`);

    res.status(200).json({
      message: "You have succesfully loggedin.",
    });


  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});




router.post('/reusername', async (req, res) => {


  console.log(req.body);


  let userid = req.body.userid;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  try {



    let updatepassword = await db.query(`update users_table set firstname = '${firstname}'  ,lastname = '${lastname}' where	id = ${userid};`);

    res.status(200).json({
      message: "You have succesfully loggedin.",
    });


  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});




router.post('/reusercar', async (req, res) => {





  let userid = req.body.userid;
  let brandcar = req.body.brandcar;
  let carregistration = req.body.carregistration;
  let carpaint = req.body.carpaint;
  try {



    let updatepassword = await db.query(`update userscar_table set car_carregistration = '${carregistration}'  ,car_bran = '${brandcar}' ,car_colar = '${carpaint}' where	users_table_id = ${userid};`);

    res.status(200).json({
      message: "You have succesfully loggedin.",
    });


  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});


router.get('/userinformation', async (req, res) => {




  try {
    let userId = JSON.stringify(req.headers.userid);
    console.log(userId);


    

    let sqlqurry = `SELECT prefix , firstname ,lastname,email,car_carregistration , car_bran ,car_colar,cardNumber,expiryDate,cvvCode FROM users_table   
    inner join  creditcard_table on users_table.id = creditcard_table.users_table_id
    inner join  userscar_table on users_table.id = userscar_table.users_table_id where users_table.id = ${userId};`;

    console.log(sqlqurry);
    const user = await db.query(sqlqurry);
    if (user.length > 0) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({
        status: 401,
        message: "users already exist"
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, status: '500' });
  }
});


module.exports = router;






