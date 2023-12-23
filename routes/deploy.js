var express = require("express");
const {
  Select,
  InsertTable,
  Update,
  SelectParameter,
} = require("./repository/spidb");
const {
  Deploy,
  Return,
  DeployProduct,
  Product,
  Employee,
} = require("./model/spimodel");
const {
  SelectStatement,
  convertExcelDate,
} = require("./repository/customhelper");
const { GetValue, DLV, DLY } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "deploy");
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
      d_serial,
      d_date,
      e_fullname as d_deployby,
      d_deployto,
      d_referenceno
      from deploy
      inner join employee on e_id = d_deployby
      LIMIT ${itemsPerPage} OFFSET ${offset}`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Deploy(result);
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
    const { assetcontrol, serial, date, deployby, deployto, referenceno } =
      req.body;
    let deploy = [
      [assetcontrol, serial, date, deployby, deployto, referenceno],
    ];
    console.log(deploy);

    Check_Deploy(assetcontrol, date, deployto)
      .then((result) => {
        let data = Deploy(result);

        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Deploy_Product(assetcontrol)
            .then((result) => {
              console.log(result);
              InsertTable("deploy", deploy, (err, result) => {
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
    let dataJson = DeployProduct(JSON.parse(data));
    let deploy = [];
    let counter = 0;
    let noentry = [];
    let dupentry = [];

    dataJson.forEach((item) => {
      // console.log(item.serial);
      Check_Product(item.serial)
        .then((result) => {
          let product = Product(result);
          // console.log(product[0].assetcontrol);

          Check_Employee(item.deployby)
            .then((result) => {
              let employee = Employee(result);
              // console.log(employee[0].fullname);
              let deployby = employee[0].id;

              Check_Deploy(
                product[0].assetcontrol,
                convertExcelDate(item.date),
                item.deployto
              )
                .then((result) => {
                  let deploydup = Deploy(result);
                  counter += 1;

                  // console.log(deploydup.length);

                  if (deploydup.length != 0) {
                    // console.log("Duplicate: ", item.serial);
                    dupentry.push(item.serial);
                  } else {
                    if (product.length != 0) {
                      let assetcontrol = product[0].assetcontrol;
                      let status = GetValue(DLY());
                      let update_product =
                        "update product set p_status=? where p_assetcontrol=?";
                      let update_product_data = [status, assetcontrol];

                      deploy.push([
                        assetcontrol,
                        item.serial,
                        convertExcelDate(item.date),
                        deployby,
                        item.deployto,
                        item.referenceno,
                      ]);

                      Update(
                        update_product,
                        update_product_data,
                        (err, result) => {
                          if (err) console.error("Error: ", err);
                          // console.log(result);
                        }
                      );
                    } else {
                      noentry.push(item.serial);
                    }
                  }

                  // console.log(
                  //   "Counter: ",
                  //   counter,
                  //   "Current: ",
                  //   dataJson.length
                  // );
                  // console.log("No Entry: ", noentry);
                  // console.log("Dup Entry: ", dupentry);
                  // console.log("Deploy: ", item.deployby);
                  // console.log("Employee: ", employee);
                  if (counter == dataJson.length) {
                    if (deploy.length != 0) {
                      InsertTable("deploy", deploy, (err, result) => {
                        if (err) console.error("Error: ", err);
                        console.log(result);
                      });
                    }

                    let message = "";

                    if (noentry != 0) {
                      message += "noentry";
                    }
                    if (dupentry != 0) {
                      message += "dupentry";
                    }

                    console.log(message);
                    if (message != "") {
                      return res.json({
                        msg: message,
                        data: {
                          noentry: noentry,
                          dupentry: dupentry,
                        },
                      });
                    } else {
                      res.json({
                        msg: "success",
                      });
                    }
                  }
                })
                .catch((error) => {
                  console.error(
                    "Error: ",
                    error,
                    item.deployby,
                    item.serial,
                    product[0].assetcontrol,
                    "Check Deploy"
                  );
                  return res.json({
                    msg: error,
                  });
                });
            })
            .catch((error) => {
              console.error(
                "Error: ",
                error,
                "Name:",
                item.deployby,
                item.serial
              );
              return res.json({
                msg: error,
              });
            });
        })
        .catch((error) => {
          console.error("Serial: ", item.serial, "Error: ", error);
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

//#region
function Check_Deploy(assetcontrol, date, deployto) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from deploy where d_assetcontrol=? and d_date=? and d_deployto=?";
    let command = SelectStatement(sql, [assetcontrol, date, deployto]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);
      resolve(result);
    });
  });
}

function Deploy_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(DLY()), assetcontrol];
    let sql = "update product set p_status=? where p_assetcontrol=?";

    console.log(data);
    Update(sql, data, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      }

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
