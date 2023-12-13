var express = require("express");
const { Repair } = require("./model/spimodel");
const { Select, InsertTable } = require("./repository/spidb");
const { SelectStatement } = require("./repository/customhelper");
const { GetValue, RPRD } = require("./repository/dictionary");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("repair", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = "select * from repair";
    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Repair(result);
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

router.post("/save", (req, res) => {
  try {
    const { assetcontrol, serial, date, repairby, referenceno } = req.body;
    let repair = [[assetcontrol, serial, date, repairby, referenceno]];

    Check_Repair(assetcontrol, date)
      .then((result) => {
        let data = Repair(result);

        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Repair_Product(assetcontrol)
            .then((result) => {
              InsertTable("repair", repair, (err, result) => {
                if (err) console.error("Error: ", err);
                console.log(result);

                res.json({
                  msg: "success",
                });
              });
            })
            .catch((error) => {
              res.json({
                msg: error,
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

//#region
function Check_Repair(assetcontrol, date) {
  return new Promise((resolve, reject) => {
    let sql = "select * from repair where d_assetcontrol=? and d_date=?";
    let command = SelectStatement(sql, [assetcontrol, date]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);
      resolve(result);
    });
  });
}

function Repair_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(RPRD()), assetcontrol];
    let sql = "update product set p_status=? p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
