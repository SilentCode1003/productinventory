var express = require('express');
const { Validator } = require('./controller/middleware');
var router = express.Router();
const { Select } = require("./repository/spidb");
const { Deploy } = require("./model/spimodel");

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  Validator(req, res, "index");
});

module.exports = router;

router.post("/soldtoday", (req, res) => {
  try {
    let sql = `SELECT 
        s_id AS id, 
        s_assetcontrol AS assetcontrol, 
        s_serial AS serial, 
        mi_name AS productname, 
        mc_name AS category, 
        p_status AS status, 
        e_fullname AS soldby, 
        s_date AS date, 
        mip_fobprice AS price,
        s_referenceno AS referenceno
      FROM 
        sold
      INNER JOIN 
        product ON p_assetcontrol = s_assetcontrol AND p_serial = s_serial 
      INNER JOIN 
        master_item ON mi_id = p_itemname
      INNER JOIN 
        master_category ON mc_id = p_category
      INNER JOIN 
        employee ON e_id = s_soldby
      INNER JOIN 
        master_item_price ON mip_itemid = mi_id 
      WHERE 
        DATE(s_date) = CURDATE();`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      if (result.length != 0) {
        console.log(result);
        res.json({
          msg: "success",
          data: result,
        });
      } else {
        res.json({
          msg: "success",
          data: result,
        });
      }
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.get("/deployedtoday", (req, res) => {
  try {

    let sql = `SELECT 
        d_id,
        d_assetcontrol,
        d_serial,
        d_date,
        e_fullname as d_deployby,
        d_deployto,
        d_referenceno
      FROM deploy
      INNER JOIN employee on e_id = d_deployby
      WHERE DATE(d_date) = CURDATE()`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Deploy(result);
      res.json({
        msg: "success",
        data: data,
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});