var express = require("express");
const { Select } = require("./repository/spidb");
const { Transfer } = require("./model/spimodel");
const { GetValue, TRFR } = require("./repository/dictionary");
const { SelectStatement } = require("./repository/customhelper");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("transfer", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = "select * from transfer";
    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Transfer(result);
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
    const {
      assetcontrol,
      serial,
      date,
      transferby,
      from,
      receiveby,
      to,
      referenceno,
    } = req.body;
    let transfer = [
      [
        assetcontrol,
        serial,
        date,
        transferby,
        from,
        receiveby,
        to,
        referenceno,
      ],
    ];

    Check_Transfer(assetcontrol, date, from, to)
      .then((result) => {
        let data = Transfer(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Transfer_Product()
            .then((result) => {
              InsertTable("transfer", transfer, (err, result) => {
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

function Check_Transfer(assetcontrol, date, from, to) {
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

function Transfer_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(TRFR()), assetcontrol];
    let sql = "update product set p_status=? where p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
