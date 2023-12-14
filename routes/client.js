var express = require("express");
var router = express.Router();

const {
  Update,
  Select,
  InsertTable,
  SelectParameter,
} = require("./repository/spidb");
const dictionary = require("./repository/dictionary");
const helper = require("./repository/customhelper");
const { MasterClient } = require("./model/spimodel");
const { Validator } = require("./controller/middleware");

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("client", { title: "Express" });
  Validator(req, res, "client");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select * from master_client`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      if (result.length != 0) {
        let data = MasterClient(result);

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
    let branch = req.body.branch;
    let company = req.body.company;
    let status = dictionary.GetValue(dictionary.ACT());
    let createdby =
      req.session.fullname == null ? "dev42" : req.session.fullname;
    let createddate = helper.GetCurrentDatetime();
    let master_client = [];

    Check_Client(branch, company)
      .then((result) => {
        let data = MasterClient(result);

        if (data.length != 0) {
          return res.json({
            msg: "exist",
          });
        } else {
          master_client.push([branch, company, status, createdby, createddate]);
          InsertTable("master_client", master_client, (err, result) => {
            if (err) console.error("Error: ", err);

            console.log(result);
            res.json({
              msg: "success",
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

router.post("/edit", (req, res) => {
  try {
    const { branch, company, id } = req.body;
    let data = [];
    let sql_update = "UPDATE master_client SET";

    if (branch != "") {
      sql_update += " mc_branch=?,";
      data.push(branch);
    }
    if (company != "") {
      sql_update += " mc_company=?,";
      data.push(company);
    }

    sql_update = sql_update.slice(0, -1);
    sql_update += " WHERE mc_id=?";
    data.push(id);
    console.log("Update Data: ", data)
    let sql_check = `SELECT * FROM master_client WHERE mc_id='${id}'`;
    Select(sql_check, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 1) {
        return res.json({
          msg: "notexist",
        });
      } else {
        Update(sql_update, data, (err, result) => {
          if (err) console.error("Error: ", err);

          console.log(result);

          res.json({
            msg: "success",
          });
        });
      }
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/status", (req, res) => {
  try {
    let id = req.body.id;
    let status =
      req.body.status == dictionary.GetValue(dictionary.ACT())
        ? dictionary.GetValue(dictionary.INACT())
        : dictionary.GetValue(dictionary.ACT());
    let data = [status, id];

    let sql_Update = `UPDATE master_client 
                     SET ma_status = ?
                     WHERE ma_id = ?`;

    console.log(data);

    Update(sql_Update, data, (err, result) => {
      if (err) console.error("Error: ", err);

      res.json({
        msg: "success",
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.get("/getcompany", (req, res) => {
  try {
    let sql = "select * from master_client";

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      let data = MasterClient(result);

      console.log(data);
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

router.post("/getbranch", (req, res) => {
  try {
    const { company } = req.body;
    let sql = "select * from master_client where mc_company=?";

    SelectParameter(sql, [company], (err, result) => {
      if (err) console.error("Error: ", err);
      let data = MasterClient(result);

      console.log(data);
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

//#region Function
function Check_Client(branch, company) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_client where mc_branch=? and mc_company=?";

    let command = helper.SelectStatement(sql, [branch, company]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}
//#endregion
