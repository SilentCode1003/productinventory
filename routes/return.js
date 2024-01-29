var express = require("express");
const { Select, InsertTable, Update, SelectParameter } = require("./repository/spidb");
const { Return, ReturnProduct, Product, SalesReportHistory, SalesReport } = require("./model/spimodel");
const { SelectStatement, convertExcelDate } = require("./repository/customhelper");
const { GetValue, RET } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("return", { title: "Express" });
  Validator(req, res, "return");
});

module.exports = router;

router.get("/load", (req, res) => {
  const page = req.query.page || 1;
  const itemsPerPage = 500;
  const offset = (page - 1) * itemsPerPage;
  
  try {
    let sql = `select 
    r_id,
    r_assetcontrol,
    r_serial,
    r_date,
    e_fullname as r_returnby,
    r_returnfrom,
    r_referenceno
    from returnitem
    inner join employee on e_id = r_returnby
    LIMIT ${itemsPerPage} OFFSET ${offset};`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Return(result);
      res.json({
        msg: "success",
        data: data,
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/save", (req, res) => {
  try {
    const { assetcontrol, serial, date, returnby, returnfrom, referenceno } =
      req.body;
    let returnitem = [
      [assetcontrol, serial, date, returnby, returnfrom, referenceno],
    ];
    console.log("return data", returnitem)

    Check_Return(assetcontrol, date)
      .then((result) => {
        let data = Return(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Return_Product(assetcontrol)
            .then((result) => {
              Check_SalesReport(assetcontrol)
                .then((salesResult) => {
                  if(salesResult != 0){
                    let status = GetValue(RET());
                    let update_product =
                      "update sales_report set sr_status=? where sr_assetcontrol=?";
                    let update_product_data = [status, assetcontrol];

                    Update(update_product, update_product_data, (err, result) => {
                      if (err) console.error("Error: ", err);
                      // console.log(result);
                    });
                  }
                }).catch((error) => {
                  res.json({
                    msg: error,
                  });
                });
              InsertTable("returnitem", returnitem, (err, result) => {
                if (err) console.error("Error: ", err);
                console.log(result);

                res.json({
                  msg: "success",
                });
              });
            })
            .catch((error) => {
              res.json({
                msg: error,
              });
            });
        }
      })
      .catch((error) => {
        res.json({
          msg: error,
        });
      });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/upload", (req, res) => {
  try {
    const { data } = req.body;
    let dataJson = ReturnProduct(JSON.parse(data));
    console.log(dataJson)
    let returndata = [];
    let counter = 0;
    let noentry = [];
    let duplicate = []
    let historycounter = 0;

    dataJson.forEach((item) => {
      Check_Product(item.serial)
        .then((result) => {
          let data = Product(result);
          // console.log(data);
          if (data.length != 0) {
            let assetcontrol = data[0].assetcontrol;
            let status = GetValue(RET());
            let update_product =
              "update product set p_status=? where p_assetcontrol=?";
            let update_product_data = [status, assetcontrol];

            Check_Return(assetcontrol, convertExcelDate(item.date))
            .then((result) => {
              let data = Return(result);
              counter += 1;

              if (data.length != 0) {
                duplicate.push(item.serial);
              } else {
                returndata.push([
                  assetcontrol,
                  item.serial,
                  convertExcelDate(item.date),
                  item.returnby,
                  item.returnfrom,
                  item.referenceno,
                ]);

                Check_SalesReport(assetcontrol)
                  .then((salesResult) => {
                    let sales = SalesReport(salesResult);
                    if (salesResult != 0) {
                      let soldrefno = sales[0].soldrefno;
                      let status = GetValue(RET());
                      let report =
                        "update sales_report set sr_status=? where sr_assetcontrol=?";
                      let report_data = [status, assetcontrol];

                      Record_SalesHistory(soldrefno, convertExcelDate(item.date), assetcontrol)
                        .then((historyResult) => {
                          console.log("Updated Details: ", historyResult);
                        })

                      Update(report, report_data, (err, result) => {
                        if (err) console.error("Error: ", err);
                        // console.log(result);
                      });
                    }
                    
                  }).catch((error) => {
                    res.json({
                      msg: error,
                    });
                  });
                
                Update(update_product, update_product_data, (err, result) => {
                  if (err) console.error("Error: ", err);
                  // console.log(result);
                });
              }
              console.log("counter: ", counter)
              if (counter == dataJson.length) {
                console.log("No Entry: ", noentry);
                console.log("Done: ");
                if (returndata.length != 0) {
                  InsertTable("returnitem", returndata, (err, result) => {
                    if (err) console.error("Error: ", err);
                    console.log(result);

                    return res.json({
                      msg: "success",
                    });
                  });
                } else {
                  return res.json({
                    msg: "duplicate",
                  });
                }
              }
            });
            

          } else {
            noentry.push(item.serial);
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

function Check_Return(assetcontrol, date, from, to) {
  return new Promise((resolve, reject) => {
    let sql = "select * from returnitem where r_assetcontrol=? and r_date=?";
    let command = SelectStatement(sql, [assetcontrol, date]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

function Return_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(RET()), assetcontrol];
    let sql = "update product set p_status=? where p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      console.log(result);

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

function Record_SalesHistory(soldrefno, date, assetcontrol) {
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

      let newHistory = {
        RETURNED: { date: date, details: "Returned: " + assetcontrol }
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
