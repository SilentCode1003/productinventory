var express = require("express");
const { Sold } = require("./model/spimodel");
const { InsertTable } = require("./repository/spidb");
const { SLD, GetValue } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("sold", { title: "Express" });
  Validator(req, res, "sold")
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select 
    s_id,
    s_assetcontrol,
    s_serial,
    s_date,
    e_fullname as s_soldby,
    s_soldto,
    s_referenceno
    from sold
    inner join employee on e_id = s_soldby`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Sold(result);
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
    const { assetcontrol, serial, date, soldby, soldto, referenceno } =
      req.body;
    let sold = [[assetcontrol, serial, date, soldby, soldto, referenceno]];
    console.log("Sold data: ", sold)
    Check_Sold(assetcontrol, date, soldto)
      .then((result) => {
        let data = Sold(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Sold_Product()
            .then((result) => {
              InsertTable("sold", sold, (err, result) => {
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

function Check_Sold(assetcontrol, date, soldto) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from sold where s_assetcontrol-? and s_date=? and s_soldto=?";
    let command = SelectStatement(sql, [assetcontrol, date, soldto]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

function Sold_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(SLD()), assetcontrol];
    let sql = "update product set p_status=? where p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
