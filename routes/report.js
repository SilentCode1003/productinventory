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

router.post("/getsalesreport", (req, res) => {
  try {
    // let daterange = req.body.daterange;
    // let [startDate, endDate] = daterange.split(" - ");

    // let formattedStartDate = startDate.split("/").reverse().join("-");
    // let formattedEndDate = endDate.split("/").reverse().join("-");

    // formattedStartDate = formattedStartDate.replace(
    //   /(\d{4})-(\d{2})-(\d{2})/,
    //   "$1-$3-$2"
    // );
    // formattedEndDate = formattedEndDate.replace(
    //   /(\d{4})-(\d{2})-(\d{2})/,
    //   "$1-$3-$2"
    // );

    let sql = `SELECT sr_date as date, sr_soldrefno as soldrefno,  mc_name as category, mi_name as itemname, 
                sr_sellingprice as price, sr_quantity as quantity, sr_paymenttype as paymenttype, 
                sr_referenceno as transacrefno, sr_status as status
              FROM cyberpowerproduct.sales_report
              INNER JOIN master_item ON sr_item = mi_id
              INNER JOIN master_category ON sr_category = mc_id;`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      if (result.length != 0) {
        console.log(result);
        res.json({
          msg: "success",
          data: result,
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