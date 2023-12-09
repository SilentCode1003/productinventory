var express = require("express");
var router = express.Router();


const { Select, InsertTable, SelectParameter } = require("./repository/spidb");
const { Product } = require("./model/spimodel");
const { GenerateAssetTag } = require("./repository/customhelper");
const { GetValue, WH } = require("./repository/dictionary");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("product", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `SELECT 
    p.p_assetcontrol as p_assetcontrol,
    p.p_serial as p_serial,
    mi.mi_name as p_itemname,
    mc.mc_name as p_category,
    p.p_podate as p_podate,
    p.p_ponumber as p_ponumber,
    p.p_warrantydate as p_warrantydate,
    p.p_status as p_status
    FROM 
        product p
    INNER JOIN 
        master_item mi ON p.p_itemname = mi.mi_id
    INNER JOIN 
        master_category mc ON p.p_category = mc.mc_id`;


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

    // console.log(serial);



    Product_Check(serial)
      .then((result) => {
        if (result[0].total != 0) {
          res.json({
            msg: "exist",
          });
        } else {
          Product_Count()
            .then((result) => {
              sequence = parseInt(
                result[0].total == 0 ? sequence : result[0].total++
              );
              let product = [
                [
                  GenerateAssetTag(category, sequence),
                  serial,
                  itemname,
                  category,
                  podate,
                  ponumber,
                  warrantydate,
                  status,
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
        }
      })
      .catch((error) => {
        return res.json({
          msg: error,
        });
      });
  } catch (error) {
    return res.json({
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

      // console.log(result);

      resolve(result);
    });
  });
}

function Product_Check(serial) {
  return new Promise((resolve, reject) => {
    let sql = "select count(*) as total from product where p_serial=?";

    SelectParameter(sql, [serial], (err, result) => {
      if (err) reject(err);

      // console.log(result);
      resolve(result);
    });
  });
}
//#endregion
