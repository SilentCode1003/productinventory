var express = require("express");
const {
  Sold,
  SoldProduct,
  MasterClient,
  Product,
} = require("./model/spimodel");
const {
  InsertTable,
  Select,
  Update,
  SelectParameter,
} = require("./repository/spidb");
const { SLD, GetValue, ACT } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const {
  SelectStatement,
  RemoveSpecialCharacters,
  GetCurrentDatetime,
  convertExcelDate,
} = require("./repository/customhelper");
const {
  JsonErrorResponse,
  JsonSuccess,
  JsonWarningResponse,
  MessageStatus,
} = require("./repository/responce");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("sold", { title: "Express" });
  Validator(req, res, "sold");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = 500;
    const offset = (page - 1) * itemsPerPage;

    let sql = `select 
    s_id,
    s_assetcontrol,
    s_serial,
    s_date,
    e_fullname as s_soldby,
    s_soldto,
    s_referenceno
    from sold
    inner join employee on e_id = s_soldby
    LIMIT ${itemsPerPage} OFFSET ${offset}`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {
        let data = Sold(result);

        // console.log(data);
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
    const { assetcontrol, serial, date, soldby, soldto, referenceno } =
      req.body;
    let sold = [[assetcontrol, serial, date, soldby, soldto, referenceno]];
    console.log("Sold data: ", sold);
    Check_Sold(assetcontrol, date, soldto)
      .then((result) => {
        let data = Sold(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Sold_Product(assetcontrol)
            .then((result) => {
              InsertTable("sold", sold, (err, result) => {
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

router.post("/getsold", (req, res) => {
  try {
    let daterange = req.body.daterange;
    let category = req.body.category;
    let [startDate, endDate] = daterange.split(" - ");

    let formattedStartDate = startDate.split("/").reverse().join("-");
    let formattedEndDate = endDate.split("/").reverse().join("-");

    formattedStartDate = formattedStartDate.replace(
      /(\d{4})-(\d{2})-(\d{2})/,
      "$1-$3-$2"
    );
    formattedEndDate = formattedEndDate.replace(
      /(\d{4})-(\d{2})-(\d{2})/,
      "$1-$3-$2"
    );

    let sql = `SELECT s_id as id, s_assetcontrol as assetcontrol, s_serial as serial, mi_name as productname, 
              mc_name as category, p_status as status, e_fullname as soldby, s_date as date, mip_fobprice as price
              FROM sold 
              INNER JOIN product on p_assetcontrol = s_assetcontrol and p_serial = s_serial 
              INNER JOIN master_item on mi_id = p_itemname
              INNER JOIN master_category on mc_id = p_category
              INNER JOIN employee on e_id = s_soldby
              INNER JOIN master_item_price on mip_itemid = mi_id 
              WHERE mc_name = '${category}' AND s_date BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`;

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

router.post("/upload", (req, res) => {
  try {
    const { data } = req.body;
    let dataJson = SoldProduct(JSON.parse(data));
    let sold = [];
    let counter = 0;
    let noentry = [];
    let dupentry = [];

    dataJson.forEach((item) => {
      Check_MasterClient(item.company, item.branch, req)
        .then((result) => {
          let soldto = result;

          Check_Product(item.serial)
            .then((result) => {
              let product = Product(result);

              if (product.length != 0) {
                let assetcontrol = product[0].assetcontrol;

                Check_Sold(assetcontrol, item.date, soldto)
                  .then((result) => {
                    let check_sold = Sold(result);
                    counter += 1;

                    if (check_sold.length != 0) {
                      dupentry.push(item.serial);

                      let status = GetValue(SLD());
                      let product_update =
                        "update product set p_status=? where p_assetcontrol=?";
                      let product = [status, assetcontrol];
                      Update(product_update, product, (err, result) => {
                        if (err) console.error("Error: ", err);
                        // console.log(result);
                      });
                    } else {
                      sold.push([
                        assetcontrol,
                        item.serial,
                        convertExcelDate(item.date),
                        item.soldby,
                        soldto,
                        item.referenceno,
                      ]);

                      let status = GetValue(SLD());
                      let product_update =
                        "update product set p_status=? where p_assetcontrol=?";
                      let product = [status, assetcontrol];
                      Update(product_update, product, (err, result) => {
                        if (err) console.error("Error: ", err);
                        // console.log(result);
                      });
                    }

                    if (counter == dataJson.length) {
                      // console.log(sold);
                      if (sold.length != 0) {
                        InsertTable("sold", sold, (err, result) => {
                          if (err) console.error("Error: ", err);
                          console.log(result);
                        });
                      }

                      let message = "";
                      if (dupentry.length != 0) {
                        message += MessageStatus.DUPENTRY;
                      }
                      if (noentry.length != 0) {
                        message += MessageStatus.NOENTRY;
                      }

                      if (message != "") {
                        res.json(
                          JsonWarningResponse(message, [dupentry, noentry])
                        );
                      } else {
                        res.json(JsonSuccess());
                      }
                    }
                  })
                  .catch((error) => {
                    console.error(error, item.serial);
                    res.json(JsonErrorResponse(error));
                  });
              } else {
                counter += 1;
                noentry.push(item.serial);
                // console.log("No Entry: ", item.serial);
              }
            })
            .catch((error) => {
              console.error(error, item.serial);
              res.json(JsonErrorResponse(error));
            });
        })
        .catch((error) => {
          console.error(error, item.company, item.branch);
          res.json(JsonErrorResponse(error));
        });
    });
  } catch (error) {
    console.error(error);
    res.json(JsonErrorResponse(error));
  }
});

//#region Function

function Check_Sold(assetcontrol, date, soldto) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from sold where s_assetcontrol=? and s_date=? and s_soldto=?";
    let command = SelectStatement(sql, [assetcontrol, date, soldto]);

    Select(command, (err, result) => {
      if (err) reject(err);

      // console.log(result);

      resolve(result);
    });
  });
}

function Sold_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(SLD()), assetcontrol];
    let sql = "update product set p_status=? where p_assetcontrol=?";

    Update(sql, data, (err, result) => {
      if (err) reject(err);

      // console.log(result);

      resolve(result);
    });
  });
}

function Check_MasterClient(company, branch, req) {
  return new Promise((resolve, reject) => {
    let _company = RemoveSpecialCharacters(company);
    let _branch = RemoveSpecialCharacters(branch);
    let status = GetValue(ACT());
    let createdby =
      req.session.fullname == null ? "dev42" : req.session.fullname;
    let createddate = GetCurrentDatetime();

    let sql = "select * from master_client where mc_company=? and mc_branch=?";
    let command = SelectStatement(sql, [_company, _branch]);

    Select(command, (err, result) => {
      if (err) reject(err);
      let data = MasterClient(result);

      if (data.length != 0) {
        let master_client = [
          [_company, _branch, status, createdby, createddate],
        ];
        InsertTable("master_client", master_client, (err, result) => {
          if (err) reject(err);

          resolve(`${_company}-${_branch}`);
        });
      } else {
        resolve(`${_company}-${_branch}`);
      }
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

function Check_Employee(fullname) {
  return new Promise((resolve, reject) => {
    let sql = "select * from employee where e_fullname like ?";
    SelectParameter(sql, [`%${fullname}%`], (err, result) => {
      if (err) reject(err);
      // console.log(result);

      resolve(result);
    });
  });
}

//#endregion
