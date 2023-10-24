var express = require("express");
var router = express.Router();

const mysql = require("./repository/spidb");
const dictionary = require("./repository/dictionary");
const helper = require("./repository/customhelper");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("category", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select * from master_category`;

    mysql.Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      res.json({
        msg: "success",
        data: result,
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/save", (req, res) => {
  try {
    let id = req.body.id;
    let status = dictionary.GetValue(dictionary.ACT());
    let createdby = req.session.fullname;
    let createddate = helper.GetCurrentDatetime();
    let master_category = [];

    master_category.push([id, status, createdby, createddate]);
    mysql.InsertTable("master_category", master_category, (err, result) => {
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
    let idmodal = req.body.idmodal;
    let id = req.body.id;

    let data = [idmodal, id];

    let sql_Update = `UPDATE master_category 
                     SET mc_name = ?
                     WHERE mc_id = ?`;

    let sql_check = `SELECT * FROM master_category WHERE mc_id='${id}'`;

    console.log(data);

    mysql.Select(sql_check, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 1) {
        return res.json({
          msg: "notexist",
        });
      } else {
        mysql.UpdateMultiple(sql_Update, data, (err, result) => {
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
    let id = req.body.id;
    let status =
      req.body.status == dictionary.GetValue(dictionary.ACT())
        ? dictionary.GetValue(dictionary.INACT())
        : dictionary.GetValue(dictionary.ACT());
    let data = [status, id];

    let sql_Update = `UPDATE master_category 
                     SET mc_status = ?
                     WHERE mc_id = ?`;

    console.log(data);

    mysql.UpdateMultiple(sql_Update, data, (err, result) => {
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
