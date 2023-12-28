var express = require("express");
const {  } = require("./model/spimodel");
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
const { JsonErrorResponse } = require("./repository/responce");
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
    res.json(JsonErrorResponse());
  }
});
