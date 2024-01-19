var express = require("express");
const { Validator } = require("./controller/middleware");
var router = express.Router();

const { JsonErrorResponse } = require("./repository/responce");
const { GeneratePDF } = require("./repository/pdf");
const { SalesReport, SalesReportHistory } = require("./model/spimodel");
const {
  Update,
  Select,
  InsertTable,
  SelectParameter,
} = require("./repository/spidb");

router.get("/", function (req, res, next) {
  // res.render("report", { title: "Express" });
  Validator(req, res, "report");
});

module.exports = router;

router.get("/pdf", (req, res) => {
  try {
    GeneratePDF()
      .then((result) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=Sales_Report.pdf"
        );

        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.json(JsonErrorResponse(error));
      });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});

router.get("/salesreport", (req, res) => {
  try {
    let sql = `select * from sales_report`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log("Data: ", result);

      if (result.length != 0) {
        let data = SalesReport(result);

        console.log(data);
        res.json({
          msg: "success",
          data: data,
        });
      } else {
        res.json({
          msg: "success",
          data: result,
        });
      }
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.get("/salesreporthistory", (req, res) => {
  try {
    let sql = `select * from sales_report_history`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log("Data: ", result);

      if (result.length != 0) {
        let data = SalesReportHistory(result);

        console.log(data);
        res.json({
          msg: "success",
          data: data,
        });
      } else {
        res.json({
          msg: "success",
          data: result,
        });
      }
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});