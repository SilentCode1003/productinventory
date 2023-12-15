var express = require("express");
const { Encrypter } = require("./repository/cryptography");
const { SelectStatement } = require("./repository/customhelper");
const { Select, SelectParameter } = require("./repository/spidb");
const { Employee, MasterPosition, MasterAccess, MasterDepartment } = require("./model/spimodel");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Express" });
});

module.exports = router;

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    let sql = `select 
    e_id,
    e_fullname,
    mp_name as e_position,
    md_name as e_department,
    e_username,
    e_password,
    ma_name as e_access,
    e_status,
    e_createdby,
    e_createddate
    from employee
    inner join master_position on e_position = mp_id
    inner join master_department on e_department = md_id
    inner join master_access on e_access = ma_id
    where e_username = ? and e_password = ?`;

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);
      let data = [username, encrypted];
      let command = SelectStatement(sql, data);

      Select(command, (err, result) => {
        if (err) console.error("Error: ", err);

        let info = Employee(result);
        console.log(info)
        if (info.length != 0) {
          info.forEach((user) => {
            req.session.fullname = user.fullname;
            req.session.position = user.position;
            req.session.access = user.access;
            req.session.department = user.department;
          });
          return res.json({
            msg: "success",
            data: info,
          });
        } else {
          return res.json({
            msg: "incorrect",
          });
        }
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.json({
        msg: err,
      });
    }

    res.json({
      msg: "success",
    });
  });
});