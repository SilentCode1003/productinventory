var express = require("express");
var router = express.Router();

const {
  Update,
  Select,
  InsertTable,
  SelectParameter,
} = require("./repository/spidb");
const dictionary = require("./repository/dictionary");
const helper = require("./repository/customhelper");
const { MasterItem } = require("./model/spimodel");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("items", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select
    mi_id as mi_id,
    mi_name as mi_name,
    mc_name as mi_category,
    mi_createdby as mi_createdby,
    mi_createddate as mi_createddate,
    mi_status as mi_status
    from master_item
    inner join master_category on mi_category = mc_id`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      console.log(result);

      if (result.length != 0) {
        let data = MasterItem(result);
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

router.post("/getitemsbycategory", (req, res) => {
  try {
    const id = req.body.id;
    let sql = `select
    mi_id as mi_id,
    mi_name as mi_name,
    mc_name as mi_category,
    mi_createdby as mi_createdby,
    mi_createddate as mi_createddate,
    mi_status as mi_status
    from master_item
    inner join master_category on mi_category = mc_id where mi_category = ${id}`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      console.log(result);

      if (result.length != 0) {
        let data = MasterItem(result);
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
    const { itemsname, categoryid } = req.body;
    let status = dictionary.GetValue(dictionary.ACT());
    let createdby =
      req.session.fullname == null ? "dev42" : req.session.fullname;
    let createddate = helper.GetCurrentDatetime();
    let master_item = [[itemsname, categoryid, status, createdby, createddate]];
    let sql = `select * from master_item where mi_name = ?`;
    SelectParameter(sql, [itemsname], (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      if (result.length != 0) {
        return res.json({
          msg: "exist",
        });
      } else {
        InsertTable("master_item", master_item, (err, result) => {
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

router.post("/edit", (req, res) => {
  try {
    let itemsnamemodal = req.body.itemsnamemodal;
    let itemscode = req.body.itemscode;

    let data = [itemsnamemodal, itemscode];

    let sql_Update = `UPDATE master_item 
                     SET mi_name = ?
                     WHERE mi_id = ?`;

    let sql_check = `SELECT * FROM master_item WHERE mi_id='${itemscode}'`;

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
    let itemscode = req.body.itemscode;
    let status =
      req.body.status == dictionary.GetValue(dictionary.ACT())
        ? dictionary.GetValue(dictionary.INACT())
        : dictionary.GetValue(dictionary.ACT());
    let data = [status, itemscode];

    let sql_Update = `UPDATE master_item 
                     SET mi_status = ?
                     WHERE mi_id = ?`;

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
