var express = require('express');
var router = express.Router();
const db = require('../db/database')



router.get('/', async function (req, res, next) {

    let barrier = await db.query(`select status from barrier;`);
    let status = barrier[0].status
    return res.send(`${status}`);
});


router.post('/', async function (req, res, next) {
    let stetus  = req.body.stetus;
    let  barrier = await db.query(` UPDATE barrier set status = '${stetus}' WHERE (id = '1');`);
    return res.send(`barrier no`);
});




module.exports = router;
