var express = require("express");
const { Select, InsertTable } = require("./repository/spidb");
const { Return } = require("./model/spimodel");
const { SelectStatement } = require("./repository/customhelper");
const { GetValue, RET } = require("./repository/dictionary");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("return", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = "select * from transfer";
    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Return(result);
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
    const { assetcontrol, serial, date, returnby, returnfrom, referenceno } =
      req.body;
    let returnitem = [
      [assetcontrol, serial, date, returnby, returnfrom, referenceno],
    ];

    Check_Return(assetcontrol, date, from, to)
      .then((result) => {
        let data = Return(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Return_Product()
            .then((result) => {
              InsertTable("return", returnitem, (err, result) => {
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

//#region Function

function Check_Return(assetcontrol, date, from, to) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from transfer where t_assetcontrol-? and t_date=? and t_from=? and t_to=?";
    let command = SelectStatement(sql, [assetcontrol, date, from, to]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

function Return_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(RET()), assetcontrol];
    let sql = "update product set p_status=? p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
