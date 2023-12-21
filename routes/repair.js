var express = require("express");
const { Repair } = require("./model/spimodel");
const { Select, InsertTable, Update } = require("./repository/spidb");
const { SelectStatement } = require("./repository/customhelper");
const { GetValue, RPRD } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("repair", { title: "Express" });
  Validator(req, res, "repair");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = 50;
    const offset = (page - 1) * itemsPerPage;

    let sql = `select 
    r_id,
    r_assetcontrol,
    r_serial,
    r_date,
    e_fullname as r_repairby,
    r_referenceno
    from repair
    inner join employee on e_id = r_repairby
    LIMIT ${itemsPerPage} OFFSET ${offset}`;

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
    console.log("repair data: ", repair)
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
    let sql = "select * from repair where r_assetcontrol=? and r_date=?";
    let command = SelectStatement(sql, [assetcontrol, date]);

    Select(command, (err, result) => {
      if (err) reject(err);

      // console.log(result);
      resolve(result);
    });
  });
}

function Repair_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(RPRD()), assetcontrol];
    let sql = "update product set p_status=? where p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
