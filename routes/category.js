var express = require("express");
var router = express.Router();

const { Update, Select, InsertTable } = require("./repository/spidb");
const dictionary = require("./repository/dictionary");
const helper = require("./repository/customhelper");
const { MasterCategory } = require("./model/spimodel");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("category", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select * from master_category`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      console.log(result);

      if (result.length != 0) {
        let data = MasterCategory(result);
        res.json({
          msg: "success",
          data: data,
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

router.post("/save", (req, res) => {
  try {
    let categoryname = req.body.categoryname;
    let status = dictionary.GetValue(dictionary.ACT());
    let createdby =
      req.session.fullname == null ? "dev42" : req.session.fullname;
    let createddate = helper.GetCurrentDatetime();
    let master_category = [];

    master_category.push([categoryname, status, createdby, createddate]);
    InsertTable("master_category", master_category, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);
      res.json({
        msg: "success",
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/edit", (req, res) => {
  try {
    let categorynamemodal = req.body.categorynamemodal;
    let categorycode = req.body.categorycode;

    let data = [categorynamemodal, categorycode];

    let sql_Update = `UPDATE master_category 
                     SET mc_name = ?
                     WHERE mc_id = ?`;

    let sql_check = `SELECT * FROM master_category WHERE mc_id='${categorycode}'`;

    console.log(data);

    Select(sql_check, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 1) {
        return res.json({
          msg: "notexist",
        });
      } else {
        Update(sql_Update, data, (err, result) => {
          if (err) console.error("Error: ", err);

          console.log(result);

          res.json({
            msg: "success",
          });
        });
      }
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/status", (req, res) => {
  try {
    let categorycode = req.body.categorycode;
    let status =
      req.body.status == dictionary.GetValue(dictionary.ACT())
        ? dictionary.GetValue(dictionary.INACT())
        : dictionary.GetValue(dictionary.ACT());
    let data = [status, categorycode];

    let sql_Update = `UPDATE master_category 
                     SET mc_status = ?
                     WHERE mc_id = ?`;

    console.log(data);

    Update(sql_Update, data, (err, result) => {
      if (err) console.error("Error: ", err);

      res.json({
        msg: "success",
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});
