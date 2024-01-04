var express = require("express");
const { ReplaceItem, Product, UploadReplaceItem } = require("./model/spimodel");
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
const { GetValue, RPRD, RPMT, RPLD } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const {
  JsonErrorResponse,
  JsonWarningResponse,
  JsonSuccess,
  MessageStatus,
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
            // console.log(result);
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
    let dataJson = UploadReplaceItem(JSON.parse(data));
    console.log(dataJson)
    let replacement = [];
    let counter = 0;
    let existing = [];
    let notexist = [];

    dataJson.forEach((item) => {
      Check_Product(item.itemserial)
        .then((result) => {
          let data = Product(result);
          // console.log(data);

          if (data.length != 0) {
            let assetcontrol = data[0].assetcontrol;
            let replacement_status = GetValue(RPMT());
            let status = GetValue(RPLD());
            let update_product =
              "update product set p_status=? where p_assetcontrol=?";
            let update_product_data = [status, assetcontrol];

            console.log("Loop: ", assetcontrol, item.itemserial, convertExcelDate(item.date))

            Check_ReplaceItem(assetcontrol, convertExcelDate(item.date))
              .then((checkresult) => {
                counter += 1;

                if (checkresult.length == 0) {
                  replacement.push([
                    assetcontrol,
                    item.itemserial,
                    item.replacedserial,
                    item.remarks,
                    convertExcelDate(item.date),
                    item.replacedby,
                    item.referenceno,
                  ]);

                  Check_Product(item.replacedserial)
                    .then((productdata) => {

                      if (productdata.length != 0) {
                        let replacementdata = Product(productdata);
                        let replacementassetcontrol = replacementdata[0].assetcontrol;

                        let update_replacement_data = [replacement_status, replacementassetcontrol]
                        Update(update_product, update_replacement_data, (err, result) => {
                          if (err) console.error("Error: ", err);

                        });
                      }
                      else {
                        return res.json(JsonWarningResponse(MessageStatus.ERROR, replacementassetcontrol));
                      }

                      Update(update_product, update_product_data, (err, result) => {
                        if (err) console.error("Error: ", err);
                        // console.log(result);
                      });

                      console.log("Counter: ", counter)
                      
                      if (counter == dataJson.length) {
                        console.log("Existing: ", existing);
                        console.log("Done: ", replacement);
                        if (replacement.length != 0) {
                          InsertTable("replaceitem", replacement, (err, result) => {
                            if (err) console.error("Error: ", err);
                            console.log("success?", result);

                            return res.json(JsonSuccess());
                          });
                        } else {
                          return res.json(JsonWarningResponse(MessageStatus.EXIST, existing));
                        }
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      return res.json({
                        msg: error,
                      });
                    });
                } else {
                  console.log("Counter: ", counter)
                  existing.push(item.itemserial);

                  if(counter === dataJson.length && replacement.length === 0){
                    console.log("Existing: ", existing)

                    return res.json(JsonWarningResponse(MessageStatus.NOENTRY, existing));
                  }
                }
              })
              .catch((error) => {
                console.error(error);
                return res.json({
                  msg: error,
                });
              });
          } else {
            notexist.push(item.itemserial);
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
