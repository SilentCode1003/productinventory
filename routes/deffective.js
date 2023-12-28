var express = require("express");
const {
  Repair,
  Product,
  RepairProduct,
  DeffectiveItem,
} = require("./model/spimodel");
const {
  Select,
  InsertTable,
  Update,
  SelectParameter,
} = require("./repository/spidb");
const {
  SelectStatement,
  convertExcelDate,
} = require("./repository/customhelper");
const { GetValue, RPRD } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const {
  JsonErrorResponse,
  JsonWarningResponse,
  JsonSuccess,
} = require("./repository/responce");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("repair", { title: "Express" });
  Validator(req, res, "deffective");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = 500;
    const offset = (page - 1) * itemsPerPage;

    let sql = `select 
    d_id,
    d_assetcontrol,
    d_itemserial,
    d_remarks,
    d_date,
    d_referenceno
    from deffectiveitem
    LIMIT ${itemsPerPage} OFFSET ${offset}`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = DeffectiveItem(result);
      res.json({
        msg: "success",
        data: data,
      });
    });
  } catch (error) {
    res.json(JsonErrorResponse());
  }
});

router.post("/save", (req, res) => {
  try {
    const { assetcontrol, itemserial, remarks, date, referenceno } = req.body;

    Check_DeffectiveItem(assetcontrol, date)
      .then((result) => {
        let data = DeffectiveItem(result);

        if (data.length != 0) {
          res.json(JsonWarningResponse("exist"));
        } else {
          let deffectiveitem = [
            [assetcontrol, itemserial, remarks, date, referenceno],
          ];

          InsertTable("deffectiveitem", deffectiveitem, (err, result) => {
            if (err) console.error("Error: ", err);
            console.log(result);
            res.json(JsonSuccess());
          });
        }
      })
      .catch((error) => {
        res.json(JsonErrorResponse(error));
      });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});

//#region Function
function Check_DeffectiveItem(assetcontrol, date) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from deffectiveitem where d_assetcontrol=? and d_date=?";
    let commad = SelectStatement(sql, [assetcontrol, date]);

    Select(commad, (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}
//#endregion
