var express = require("express");
const { Select, InsertTable } = require("./repository/spidb");
const { Return } = require("./model/spimodel");
const { SelectStatement } = require("./repository/customhelper");
const { GetValue, RET } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("return", { title: "Express" });
  Validator(req, res, "return");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select 
    r_id,
    r_assetcontrol,
    r_serial,
    r_date,
    e_fullname as r_returnby,
    r_returnfrom,
    r_referenceno
    from returnitem
    inner join employee on e_id = r_returnby;`;

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
    console.log("return data", returnitem)

    Check_Return(assetcontrol, date)
      .then((result) => {
        let data = Return(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Return_Product()
            .then((result) => {
              InsertTable("returnitem", returnitem, (err, result) => {
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
    let sql = "select * from returnitem where r_assetcontrol-? and r_date=?";
    let command = SelectStatement(sql, [assetcontrol, date]);

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
    let sql = "update product set p_status=? where p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
