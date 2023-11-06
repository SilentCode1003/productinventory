var express = require("express");
const { Select, InsertTable } = require("./repository/spidb");
const { Product } = require("./model/spimodel");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("product", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = "select * from product";

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {
        let data = Product(result);

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

router.post("/save", (req, res) => {
  try {
    const { serial, itemname, category, podate, ponumber, warrantydate } =
      req.body;
    let product = [
      [serial, itemname, category, podate, ponumber, warrantydate],
    ];

    InsertTable("product", product, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);
      res.json({
        msg: "success",
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});
