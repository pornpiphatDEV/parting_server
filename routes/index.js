var express = require('express');
var router = express.Router();
const db = require('../db/database')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});




router.get('/dashboard', async function (req, res, next) {



  if (req.session.loggedin) {

    // select (sum(servicecharge)+sum(bookingservice)) as sumservicecharge  from bill_table;


    let queryervicecharge = await db.query(`select (sum(servicecharge)) as sumservicecharge  from bill_table;`);
    let sumservicecharge = queryervicecharge[0].sumservicecharge;

    let querybookingamount = await db.query(`select count(*)as bookingamount from booking_table;`);
    let bookingamount = querybookingamount[0].bookingamount;
    let querysumparked = await db.query(`select count(*) as sumparked from booking_table where booking_status = 'เข้าจอด' or booking_status = 'รอการเข้าจอด'  or booking_status = 'สำเร็จ';`);
    let sumparked = querysumparked[0].sumparked;





    // Output username
    res.render('dashboard', { bookingamount: bookingamount, sumparked: sumparked, sumservicecharge: sumservicecharge });
  } else {
    // Not logged in
    res.redirect('/');
  }
  res.end();
});

router.get('/bookingreport', function (req, res, next) {
  res.render('bookingreport', { title: 'Express' });
});


router.get('/income', async function (req, res, next) {


  if (req.session.loggedin) {

    // select (sum(servicecharge)+sum(bookingservice)) as sumservicecharge  from bill_table;


    let sqlqurry = `select prefix, firstname,lastname ,car_carregistration,booking_status ,bookingservice ,servicecharge ,
    (booking_table.TIMESTAMP) as bookingtimestamp  from users_table 
    inner join userscar_table on users_table.id = userscar_table.users_table_id 
    inner join booking_table on users_table.id = booking_table.users_table_id 
    inner join bill_table on booking_table.id = bill_table.booking_table_id ;`;




    let bookingquery = `select prefix, firstname,lastname ,car_carregistration ,booking_status , (booking_table.TIMESTAMP) as bookingtimestamp from users_table 
    inner join userscar_table on users_table.id = userscar_table.users_table_id 
    inner join booking_table on users_table.id = booking_table.users_table_id ;`;

    let incomequrry = await db.query(sqlqurry);
    let bookingservice = await db.query(bookingquery);


    let querybookingamount = await db.query(`select count(*)as bookingamount from booking_table;`);
    let bookingamount = querybookingamount[0].bookingamount;


    let queryervicecharge = await db.query(`select (sum(servicecharge)) as sumservicecharge  from bill_table;`);
    let sumservicecharge = queryervicecharge[0].sumservicecharge;



    res.render('income', { income: incomequrry, bookingservice: bookingservice, sumservicecharge: sumservicecharge, bookingamount: bookingamount });




    // Output username

  } else {
    // Not logged in
    res.redirect('/');
  }


});

router.get('/member', async function (req, res, next) {

  if (req.session.loggedin) {
    let querylistmember = await db.query(`SELECT users_table.id,prefix , firstname ,lastname,email,car_carregistration , car_bran ,car_colar,cardNumber,expiryDate,cvvCode FROM users_table   
    inner join  creditcard_table on users_table.id = creditcard_table.users_table_id
    inner join  userscar_table on users_table.id = userscar_table.users_table_id ;` )


    res.render('member', { listmember: querylistmember });


  } else {
    res.redirect('/');
  }

});



router.get('/deletemember/:id', async function (req, res) {


  let id = req.params.id;
  db.query(`DELETE FROM users_table  WHERE id = ${id}`, function (err, result, fields) {
    if (err) throw err;

    res.redirect('/member');
  });

});


router.get('/profile/:id', async function (req, res, next) {


  if (req.session.loggedin) {
    let id = req.params.id;
    console.log(id);



    let sqlqurry = `select prefix, firstname,lastname ,car_carregistration,booking_status ,bookingservice ,servicecharge ,
   (booking_table.TIMESTAMP) as bookingtimestamp  from users_table 
   inner join userscar_table on users_table.id = userscar_table.users_table_id 
   inner join booking_table on users_table.id = booking_table.users_table_id 
   inner join bill_table on booking_table.id = bill_table.booking_table_id  where users_table.id = ${id};`;



    console.log(sqlqurry);

    let bookingquery = `select prefix, firstname,lastname ,email,car_carregistration ,booking_status , (booking_table.TIMESTAMP) as bookingtimestamp from users_table 
   inner join userscar_table on users_table.id = userscar_table.users_table_id 
   inner join booking_table on users_table.id = booking_table.users_table_id where users_table.id = ${id};`;

    console.log(bookingquery);
    let incomequrry = await db.query(sqlqurry);
    let bookingservice = await db.query(bookingquery);
    // console.log(incomequrry);
    // console.log(bookingservice);

    let membaesql = `  select users_table.id,(userscar_table.id ) as userscarid , prefix,firstname,lastname,email,car_carregistration from users_table inner join userscar_table on users_table.id = userscar_table.users_table_id where  users_table.id = ${id};`

    console.log(membaesql);
    let member = await db.query(membaesql);
    // let sumservicecharge = await db.query('select sum(servicecharge)sumservicecharge from bill_table;');

    // console.log(sumservicecharge[0].sumservicecharge);

    res.render('profilemember', { income: incomequrry, bookingservice: bookingservice, member: member });


  } else {
    res.redirect('/');
  }




});

router.get('/parkingreport', async function (req, res, next) {

  if (req.session.loggedin) {


    let parkingpostquery = `select (booking_table.TIMESTAMP) as bookingtimestamp,prefix, firstname,lastname,car_carregistration, 
    booking_status,timeincar,timeoutcar 
    from users_table inner join booking_table on users_table.id = booking_table.users_table_id
    inner join userscar_table on users_table.id = userscar_table.users_table_id 
    where booking_status =  'สำเร็จ'  or booking_status  = 'เข้าจอด';`

    let parkingpost = await db.query(parkingpostquery);
    res.render('parkingreport', { parkingpost: parkingpost });
  } else {

    // Not logged in
    res.redirect('/');
  }
});





router.post('/auth', async function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  db.query(`select * from atmin where username = '${username}' and password = '${password}';`, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      req.session.loggedin = true;
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  });
});




router.post('/remember', async function (req, res) {

  console.log(req.body);
  let uid = req.body.uid;
  let userscarid = req.body.userscarid;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let car_carregistration = req.body.car_carregistration;

  if (firstname.length <= 0 || lastname.length <= 0 || car_carregistration.length <= 0) {
    return res.status(401).send("not remember");
  } else {
    await db.query(`update users_table set firstname = "${firstname}" , lastname = "${lastname}" where id = ${uid};`);
    await db.query(`update userscar_table set car_carregistration = "${car_carregistration}"  where id = ${userscarid};`);
    res.status(200).send("sessions");
  }





});


router.get('/logout', async function (req, res) {
  req.session.loggedin = false;
  res.redirect('/');
});




module.exports = router;
