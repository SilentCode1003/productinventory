var express = require("express");
const { SelectParameter, Select, InsertTable } = require("./repository/spidb");
const { Employee } = require("./model/spimodel");
const { GetValue, ACT } = require("./repository/dictionary");
const { GetCurrentDatetime } = require("./repository/customhelper");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("employee", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `SELECT e_id as e_id, e_fullname as e_fullname, mp_name as e_position, md_name as e_department, e_username as e_username, 
    e_password as e_password, ma_name as e_access, e_status as e_status, e_createdby as e_createdby, e_createddate as e_createddate
    FROM employee 
    INNER JOIN master_access on ma_id = e_access
    INNER JOIN master_department on md_id = e_department
    INNER JOIN master_position on mp_id = e_position`;
    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      console.log(result);
      if (result.length != 0) {
        let data = Employee(result);
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
    const { fullname, username, password, position, department, access } =
      req.body;
    let status = GetValue(ACT());
    let createdby =
      req.session.fullname == null ? "creator" : req.session.fullname;
    let createddate = GetCurrentDatetime();
    let employee = [
      [
        fullname,
        position,
        department,
        username,
        password,
        access,
        status,
        createdby,
        createddate,
      ],
    ];
    InsertTable("employee", employee, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);
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
