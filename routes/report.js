var express = require("express");
var router = express.Router();

const { JsonErrorResponse } = require("./repository/responce");
const { GeneratePDF } = require("./repository/pdf");

router.get("/", function (req, res, next) {
  res.render("report", { title: "Express" });
  // Validator(req, res, "report");
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
