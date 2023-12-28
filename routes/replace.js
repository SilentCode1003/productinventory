var express = require("express");
const { ReplaceItem } = require("./model/spimodel");
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
  Validator(req, res, "replace");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = 500;
    const offset = (page - 1) * itemsPerPage;

    let sql = `select 
    r_id,
    r_assetcontrol,
    r_itemserial,
    r_replacedserial,
    r_remarks,
    r_date,
    e_fullname as r_replacedby,
    r_referenceno
    from replaceitem
    inner join employee on e_id = r_replacedby
    LIMIT ${itemsPerPage} OFFSET ${offset}`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = ReplaceItem(result);
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
    const {
      assetcontrol,
      itemserial,
      replacedserial,
      remarks,
      date,
      replacedby,
      referenceno,
    } = req.body;

    Check_ReplaceItem(assetcontrol)
      .then((result) => {
        let data = ReplaceItem(result);

        if (data.length != 0) {
          res.json(JsonWarningResponse("exist"));
        } else {
          let replaceitem = [
            [
              assetcontrol,
              itemserial,
              replacedserial,
              remarks,
              date,
              replacedby,
              referenceno,
            ],
          ];

          InsertTable("replaceitem", replaceitem, (err, result) => {
            if (err) console.error("Error: ", err);
            console.log(result);
            res.json(JsonSuccess());
          });
        }
      })
      .catch((error) => {});
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});

//#region Function
function Check_ReplaceItem(assetcontrol) {
  return new Promise((resolve, reject) => {
    let sql = "select * from replaceitem where r_assetcontrol=?";
    SelectParameter(sql, [assetcontrol], (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}
//#endregion
