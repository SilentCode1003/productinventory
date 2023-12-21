var express = require("express");
const {
  Select,
  InsertTable,
  Update,
  SelectParameter,
} = require("./repository/spidb");
const { Transfer, TransferProduct, Product } = require("./model/spimodel");
const { GetValue, TRFR } = require("./repository/dictionary");
const {
  SelectStatement,
  convertExcelDate,
} = require("./repository/customhelper");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("transfer", { title: "Express" });
  Validator(req, res, "transfer");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = 50;
    const offset = (page - 1) * itemsPerPage;

    let sql = `SELECT 
    t_id,
    t_assetcontrol,
    t_serial,
    t_date,
    emptransfer.e_fullname as t_transferby,
    t_from,
    empreceive.e_fullname as t_receiveby,
    t_to,
    t_referenceno
    FROM 
    transfer
    INNER JOIN 
    employee as emptransfer on emptransfer.e_id = transfer.t_transferby
    inner join employee as empreceive on empreceive.e_id = transfer.t_receiveby
    LIMIT ${itemsPerPage} OFFSET ${offset}`;
    
    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      let data = Transfer(result);
      console.log("transfer Data: ", data);
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
    const {
      assetcontrol,
      serial,
      date,
      transferby,
      from,
      receiveby,
      to,
      referenceno,
    } = req.body;
    let transfer = [
      [
        assetcontrol,
        serial,
        date,
        transferby,
        from,
        receiveby,
        to,
        referenceno,
      ],
    ];
    console.log(transfer);
    Check_Transfer(assetcontrol, date, from, to)
      .then((result) => {
        let data = Transfer(result);
        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          Transfer_Product(assetcontrol)
            .then((result) => {
              InsertTable("transfer", transfer, (err, result) => {
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
    let dataJson = TransferProduct(JSON.parse(data));
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

function Check_Transfer(assetcontrol, date, from, to) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from transfer where t_assetcontrol=? and t_date=? and t_from=? and t_to=?";
    let command = SelectStatement(sql, [assetcontrol, date, from, to]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

function Transfer_Product(assetcontrol) {
  return new Promise((resolve, reject) => {
    let data = [GetValue(TRFR()), assetcontrol];
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
//#endregion
