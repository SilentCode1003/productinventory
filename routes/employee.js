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
    let sql = "select * from employee";
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
        username,
        password,
        position,
        department,
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
