var express = require("express");
const { ReplaceItem, Product, UploadReplaceItem, SalesReportHistory, SalesReport } = require("./model/spimodel");
const {
  Select,
  InsertTable,
  Update,
  SelectParameter,
} = require("./repository/spidb");
const {
  SelectStatement,
  convertExcelDate,
  GetCurrentDatetime,
  GetCurrentDate,
} = require("./repository/customhelper");
const { GetValue, RPRD, RPMT, RPLD, SLD, WH, DFCT } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const {
  JsonErrorResponse,
  JsonWarningResponse,
  JsonSuccess,
  MessageStatus,
  JsonDataResponse,
} = require("./repository/responce");
var router = express.Router();
const uuid = require('uuid');

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
    // console.log(dataJson)
    let replacement = [];
    let counter = 0;
    let counterSold = 0;
    let counterReplace = 0;
    let counterDefective = 0;
    let existing = [];
    let notexist = [];
    let notice = [];
    let success = 0;
    let failed = 0;

    dataJson.forEach((item) => {
      // console.log("Replacement Mode:", item.replacementmode, "Serial:", item.itemserial, "Date:", convertExcelDate(item.date))

      Check_Product(item.itemserial) //initial check if product exists
      .then((result) => {
        let data = Product(result);
        if (data.length != 0) {
          let assetcontrol = data[0].assetcontrol;
          let redSerial = data[0].serial;
          let redDate = GetCurrentDate();
          let replacement_status = GetValue(SLD());
          let status = GetValue(DFCT());
          let update_product =
            "update product set p_status=? where p_assetcontrol=?";
          let update_product_data = [status, assetcontrol];

          Check_ReplaceItem(assetcontrol, convertExcelDate(item.date)) //check serial of product being replaced
            .then((checkresult) => {
              counter += 1;

              if (checkresult.length == 0) {
                console.log("First validation passed!", counter, item.itemserial, "To be checked:", assetcontrol)

                Check_SalesReport(assetcontrol) //update sales report & update status if there's a match
                  .then((salesResult) => {
                    
                    let reportData = SalesReport(salesResult);
                    if(reportData.length != 0){
                      console.log("Second validation passed!", assetcontrol);

                      //rep = replacement
                      let repCategory = reportData[0].category;
                      let repItem = reportData[0].item;
                      let repDate = reportData[0].date;
                      let repQuantity = 1;
                      let repSellingPrice = reportData[0].sellingprice;
                      let repDeliveryFee = reportData[0].deliveryfee;
                      let repSoldBy = reportData[0].soldby;
                      let repSoldto = reportData[0].soldto;
                      let repPaymentType = reportData[0].paymenttype;
                      let repReferenceNo = reportData[0].referenceno;
                      let repSoldRefNo = reportData[0].soldrefno;
                      let repRemark = reportData[0].remarks;
                      let repStatus = reportData[0].status;
                      let repAssetControl = "";

                      let replacement_query = `SELECT * FROM product where p_serial = '${item.replacedserial}'`;
                      Select(replacement_query, (err, result) => {
                        if (err){
                          console.error("Error: " + err);
                        }
                        let replacementData = Product(result);
                        repAssetControl = replacementData[0].assetcontrol;

                        console.log("to be inserted in sold",repAssetControl, repDate, repSoldBy, repSoldto, repSoldRefNo)
                        
                        //Record replacement product to sold table
                        Record_Replacement_Sold(repAssetControl, repDate, repSoldBy, repSoldto, repSoldRefNo)
                        .then((recordSold) => {
                          console.log("Replacement Sold: Success!", recordSold);
                        }).catch((error) => {
                          console.error(error);
                          return res.json({
                            msg: error,
                          });
                        });

                        //Record the replacement to sales report history
                        Record_SalesHistory(repSoldRefNo, repDate, repAssetControl, assetcontrol)
                          .then((historyResult) => {
                            console.log("Update Record History: Success!", historyResult);
                          }).catch((error) => {
                            console.error(error);
                            return res.json({
                              msg: error,
                            });
                          });

                      });

                      //Replacement Sales Report
                      let salesreport = [repCategory, repItem, repDate, repQuantity, repSellingPrice,
                        repDeliveryFee, repSoldBy, repSoldto, repPaymentType, repSoldRefNo,
                        repReferenceNo, repRemark, repStatus, repAssetControl];

                      InsertTable("sales_report", [salesreport], (err, result) => {
                        if (err) console.error("Error: ", err);
                        console.log("success?", result);

                      });

                      //Record the replaced product to defective table
                      Record_Replaced_Defective(assetcontrol, redSerial, redDate, repReferenceNo, item.remarks)
                      .then((recordDefective) => {
                        console.log("Replaced Defective: Success!", recordDefective);
                      }).catch((error) => {
                        console.error(error);
                        return res.json({
                          msg: error,
                        });
                      });

                      let status = GetValue(RPLD());
                      let update_product =
                        "update sales_report set sr_status=? where sr_assetcontrol=?";
                      let update_product_data = [status, assetcontrol];

                      //update status of the replacing product
                      Update(update_product, update_product_data, (err, result) => {
                        if (err) console.error("Error: ", err);
                        console.log("Updated Sales Record: Success!", result);
                        // console.log(result);
                      });
                    }
                  }).catch((error) => {
                    res.json({
                      msg: error,
                    });
                    console.log(error);
                  });

                Check_Product(item.replacedserial)//check replacement serial
                  .then((productdata) => {

                    if (productdata.length != 0) {
                      let replacementdata = Product(productdata);
                      let replacementassetcontrol = replacementdata[0].assetcontrol;

                      let update_replacement_data = [replacement_status, replacementassetcontrol]
                      Update(update_product, update_replacement_data, (err, result) => {
                        if (err) console.error("Error: ", err);

                      });

                      Update(update_product, update_product_data, (err, result) => {
                        if (err) console.error("Error: ", err);
                        // console.log(result);
                      });
                    }
                    else {
                      failed += 1;
                      notice.push("REPLACEMENT_FOR_SERIAL_"+item.itemserial+"_("+item.replacedserial+")_DOES_NOT_EXISTS")
                    }
                    
                  })
                  .catch((error) => {
                    console.error(error);
                    return res.json({
                      msg: error,
                    });
                  });

                  
                replacement.push([
                  assetcontrol,
                  item.itemserial,
                  item.replacedserial,
                  item.remarks,
                  convertExcelDate(item.date),
                  item.replacedby,
                  item.referenceno,
                ]);
              
                if (counter == dataJson.length) {
                  console.log("triggered");
                  Insert()
                }
              } else {
                existing.push(item.itemserial);
                failed += 1;
                notice.push("SERIAL_"+item.itemserial+"_ALREADY_EXISTS")
                if (counter == dataJson.length) {
                  console.log("triggered");

                  Insert()
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
          notice.push("SERIAL_"+item.itemserial+"_DOES_NOT_EXISTS");
          counter += 1;
          failed += 1;
          if (counter == dataJson.length) {
            console.log("triggered");

            Insert()
          }
        }
      })
      .catch((error) => {
        console.error(error);
        return res.json({
          msg: error,
        });
      });
    });

    function Insert(){
      let info = {
        completed: success,
        failed: failed
      }
      // console.log("Existing: ", existing);
      // console.log("Success: ", replacement);
      // if(salesreport.length != 0){
      //   InsertTable("sales_report", salesreport, (err, result) => {
      //     if (err) console.error("Error: ", err);
      //     console.log("success?", result);

      //     return res.json(JsonSuccess());
      //   });
      // }

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

function Record_Replacement_Sold(repAssetControl, repDate, repSoldBy, repSoldto, repReferenceNo) {
  return new Promise((resolve, reject) => {
    console.log("Data pass tp replacement: ", repAssetControl, repDate, repSoldBy, repSoldto, repReferenceNo)
    let sql = "select * from product where p_assetcontrol=?";
    // console.log(serial);
    SelectParameter(sql, [repAssetControl], (err, result) => {
      if (err) reject(err);
      // console.log(result);
      let replacement = Product(result);
      console.log("replacement: " + replacement)
      let repSerial = replacement[0].serial;
      let repSold = [repAssetControl, repSerial, repDate, repSoldBy, repSoldto, repReferenceNo];

      InsertTable("sold", [repSold], (err, result) => {
        if (err){
          console.error("Error: ", err)
        }

        resolve(repSold);
        // console.log(result);
      });
    });
  });
}

function Record_Replaced_Defective(redAssetControl, redSerial, redDate, redReferenceNo, redRemarks) {
  return new Promise((resolve, reject) => {
    let redDefective = [redAssetControl, redSerial, redRemarks, redDate, redReferenceNo];

    InsertTable("deffectiveitem", [redDefective], (err, result) => {
      if (err){
        console.error("Error: ", err)
      }

      resolve(redDefective);
      // console.log(result);
    });
  });
}

function Check_SalesReport(assetcontrol) {
  return new Promise((resolve, reject) => {
    let sql = "select * from sales_report where sr_assetcontrol=?";
    // console.log(assetcontrol);
    SelectParameter(sql, [assetcontrol], (err, result) => {
      if (err) reject(err);
      // console.log(result);

      resolve(result);
    });
  });
}

function Record_SalesHistory(soldrefno, date, assetcontrol, replacedAssetcontrol) {
  return new Promise((resolve, reject) => {

    let sql =
      "select * from sales_report_history where srh_referenceno=?";
    let command = SelectStatement(sql, [soldrefno]);
    let salesreporthistory = [];

    Select(command, (err, result) => {
      if (err) {
        reject(err)
      };
      let salesHistory = SalesReportHistory(result);
      let details = JSON.parse(salesHistory[0].date);
      let id = salesHistory[0].id;
      // console.log("History Details: ", details);
      const replacementID = uuid.v4();

      let newHistory = {
        [replacementID]: { date: date, details:"Replaced: "+ replacedAssetcontrol + " Replacement: " + assetcontrol }
      };

      details.push(newHistory);

      let update_history =
      "update sales_report_history set srh_date=? where srh_referenceno=?";
      let update_history_data = [JSON.stringify(details), soldrefno];

      Update(update_history, update_history_data, (err, result) => {
        if (err) console.error("Error: ", err);
        // console.log(result);
      });

      resolve(details);

    });

  });
}

//#endregion
