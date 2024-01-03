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

    Check_ReplaceItem(assetcontrol, date)
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
      .catch((error) => {
        res.json(JsonErrorResponse(error));
      });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});

router.post("/upload", (req, res) => {
  try {
    const { data } = req.body;
    let dataJson = TransferProduct(JSON.parse(data));
    console.log(dataJson)
    let transfer = [];
    let counter = 0;
    let noentry = [];

    dataJson.forEach((item) => {
      Check_Product(item.serial)
        .then((result) => {
          counter += 1;
          let data = Product(result);
          // console.log(data);

          if (data.length != 0) {
            let assetcontrol = data[0].assetcontrol;
            let status = GetValue(TRFR());
            let update_product =
              "update product set p_status=? where p_assetcontrol=?";
            let update_product_data = [status, assetcontrol];
            
            transfer.push([
              assetcontrol,
              item.serial,
              convertExcelDate(item.date),
              item.transferby,
              item.from,
              item.receivedby,
              item.to,
              item.referenceno,
            ]);

            Update(update_product, update_product_data, (err, result) => {
              if (err) console.error("Error: ", err);
              // console.log(result);
            });
          } else {
            noentry.push(item.serial);
          }

          if (counter == dataJson.length) {
            console.log("No Entry: ", noentry);
            console.log("Done: ");
            InsertTable("transfer", transfer, (err, result) => {
              if (err) console.error("Error: ", err);
              console.log(result);

              return res.json({
                msg: "success",
              });
            });
          }
        })
        .catch((error) => {
          console.error(error);
          return res.json({
            msg: error,
          });
        });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

//#region Function
function Check_ReplaceItem(assetcontrol, date) {
  return new Promise((resolve, reject) => {
    let sql = "select * from replaceitem where r_assetcontrol=? and r_date=?";
    let commad = SelectStatement(sql, [assetcontrol, date]);

    Select(commad, (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}

function Check_Product(serial) {
  return new Promise((resolve, reject) => {
    let sql = "select * from product where p_serial=?";
    // console.log(serial);
    SelectParameter(sql, [serial], (err, result) => {
      if (err) reject(err);
      // console.log(result);

      resolve(result);
    });
  });
}
//#endregion
