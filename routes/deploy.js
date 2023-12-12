var express = require("express");
const { Select, InsertTable } = require("./repository/spidb");
const { Deploy, Return } = require("./model/spimodel");
const { SelectStatement } = require("./repository/customhelper");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("deploy", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = "select * from deploy";
    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Deploy(result);
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
    const { assetcontrol, serial, date, deployby, deployto } = req.body;
    let deploy = [[assetcontrol, serial, date, deployby, deployto]];

    Check_Deploy(assetcontrol, date, deployto)
      .then((result) => {
        let data = Deploy(result);

        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          InsertTable("deploy", deploy, (err, result) => {
            if (err) console.error("Error: ", err);
            console.log(result);

            res.json({
              msg: "success",
            });
          });
        }
      })
      .catch((error) => {});
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

//#region
function Check_Deploy(assetcontrol, date, deployto) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from deploy where d_assetcontrol=? and d_date=? and d_deployto=?";
    let command = SelectStatement(sql, [assetcontrol, date, deployto]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);
      resolve(result);
    });
  });
}

//#endregion
