var express = require("express");
const { Select, InsertTable } = require("./repository/spidb");
const { Product } = require("./model/spimodel");
const { GenerateAssetTag } = require("./repository/customhelper");
const { GetValue, WH } = require("./repository/dictionary");
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
    let sequence = 1;
    let status = GetValue(WH());

    Product_Count()
      .then((result) => {
        sequence = parseInt(result[0].total == 0 ? sequence : result[0].total);
        let product = [
          [
            GenerateAssetTag(category, sequence),
            serial,
            itemname,
            category,
            podate,
            ponumber,
            warrantydate,
            status
          ],
        ];

        InsertTable("product", product, (err, result) => {
          if (err) console.error("Error: ", err);

          console.log(result);
          res.json({
            msg: "success",
          });
        });
      })
      .catch((error) => {
        return res.json({
          msg: error,
        });
      });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

//#region Functions
function Product_Count() {
  return new Promise((resolve, reject) => {
    let sql = "select count(*) as total from product";
    Select(sql, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}
//#endregion
