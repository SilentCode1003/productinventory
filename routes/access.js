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
const { MasterAccess } = require("./model/spimodel");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("access", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select * from master_access`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      if (result.length != 0) {
        let data = MasterAccess(result);

        console.log(data);
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
    let name = req.body.name;
    let status = dictionary.GetValue(dictionary.ACT());
    let createdby =
      req.session.fullname == null ? "dev42" : req.session.fullname;
    let createddate = helper.GetCurrentDatetime();
    let master_access = [];

    Check_Access(name)
      .then((result) => {
        let data = MasterAccess(result);

        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          master_access.push([name, status, createdby, createddate]);
          InsertTable("master_access", master_access, (err, result) => {
            if (err) console.error("Error: ", err);

            console.log(result);
            res.json({
              msg: "success",
            });
          });
        }
      })
      .catch((error) => {
        res.json({
          msg: error,
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
    let namemodal = req.body.namemodal;
    let id = req.body.id;

    let data = [namemodal, id];

    let sql_Update = `UPDATE master_access 
                     SET ma_name = ?
                     WHERE ma_id = ?`;

    let sql_check = `SELECT * FROM master_access WHERE ma_id='${id}'`;

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
    let id = req.body.id;
    let status =
      req.body.status == dictionary.GetValue(dictionary.ACT())
        ? dictionary.GetValue(dictionary.INACT())
        : dictionary.GetValue(dictionary.ACT());
    let data = [status, id];

    let sql_Update = `UPDATE master_access 
                     SET ma_status = ?
                     WHERE ma_id = ?`;

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

//#region Function
function Check_Access(name) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_access where ma_name=?";

    SelectParameter(sql, [name], (err, result) => {
      if (err) reject(err);

      console.log(result);
      resolve(result);
    });
  });
}
//#endregion
