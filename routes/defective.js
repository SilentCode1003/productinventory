var express = require("express");
const {
  Repair,
  Product,
  RepairProduct,
  DeffectiveItem,
  UploadDefectiveItem
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
const { GetValue, DFCT } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const {
  JsonErrorResponse,
  JsonWarningResponse,
  JsonSuccess,
  JsonNoEntryResponse,
  MessageStatus,
} = require("./repository/responce");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("repair", { title: "Express" });
  Validator(req, res, "defective");
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
        if (result.length != 0) {
          res.json(JsonWarningResponse("exist"));
        } else {
          let data = DeffectiveItem(result);
          let deffectiveitem = [
            [assetcontrol, itemserial, remarks, date, referenceno],
          ];

          let status = GetValue(DFCT());
          let update_product =
            "update product set p_status=? where p_assetcontrol=?";
          let update_product_data = [status, assetcontrol];

          Update(update_product, update_product_data, (err, result) => {
            if (err) console.error("Error: ", err);
            // console.log(result);
          });

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


router.post("/upload", (req, res) => {
  try {
    const { data } = req.body;
    let dataJson = UploadDefectiveItem(JSON.parse(data));
    console.log(dataJson);
    let defective = [];
    let counter = 0;
    let existing = [];

    dataJson.forEach((item) => {
      Check_DeffectiveItem(item.assetcontrol, convertExcelDate(item.date))
        .then((result) => {
          counter += 1;
          if(result.length == 0){
            let status = GetValue(DFCT());
            let update_product =
              "update product set p_status=? where p_assetcontrol=?";
            let update_product_data = [status, item.assetcontrol];

            defective.push([
              item.assetcontrol,
              item.itemserial,
              item.remarks,
              convertExcelDate(item.date),
              item.referenceno,
            ]);

            Update(update_product, update_product_data, (err, result) => {
              if (err) console.error("Error: ", err);
              // console.log(result);
            });
          }else {
            existing.push(item.itemserial);
          }
          
          if (counter == dataJson.length) {
            console.log("Existing: ", existing);
            console.log("Done: ");
            if(defective.length != 0){
              InsertTable("deffectiveitem", defective, (err, result) => {
                if (err) console.error("Error: ", err);
                console.log("success?", result);
  
                return res.json(JsonSuccess());
              });
            }else{
              return res.json(JsonWarningResponse(MessageStatus.EXIST, existing));
            }
          }
        })
        .catch((error) => {
          console.error(error);
          return res.json(JsonErrorResponse(error));
        });
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
