var express = require("express");
const { Sold } = require("./model/spimodel");
const { InsertTable, Select, Update } = require("./repository/spidb");
const { SLD, GetValue } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const { SelectStatement } = require("./repository/customhelper");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("sold", { title: "Express" });
  Validator(req, res, "sold");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select 
    s_id,
    s_assetcontrol,
    s_serial,
    s_date,
    e_fullname as s_soldby,
    s_soldto,
    s_referenceno
    from sold
    inner join employee on e_id = s_soldby`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {
        let data = Sold(result);

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
    let [startDate, endDate] = daterange.split(' - ');

    let formattedStartDate = startDate.split('/').reverse().join('-');
    let formattedEndDate = endDate.split('/').reverse().join('-');

    formattedStartDate = formattedStartDate.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$3-$2');
    formattedEndDate = formattedEndDate.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$3-$2');
    

    let sql = `SELECT s_id as id, s_assetcontrol as assetcontrol, s_serial as serial, mi_name as productname, 
              mc_name as category, p_status as status, e_fullname as soldby, s_date as date
              FROM sold 
              INNER JOIN product on p_assetcontrol = s_assetcontrol and p_serial = s_serial 
              INNER JOIN master_item on mi_id = p_itemname
              INNER JOIN master_category on mc_id = p_category
              INNER JOIN employee on e_id = s_soldby
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

//#region Function

function Check_Sold(assetcontrol, date, soldto) {
  return new Promise((resolve, reject) => {
    let sql =
      "select * from sold where s_assetcontrol-? and s_date=? and s_soldto=?";
    let command = SelectStatement(sql, [assetcontrol, date, soldto]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

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

      console.log(result);

      resolve(result);
    });
  });
}

//#endregion
