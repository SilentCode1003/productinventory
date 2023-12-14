var express = require("express");
const { Encrypter } = require("./repository/cryptography");
const { SelectStatement } = require("./repository/customhelper");
const { Select } = require("./repository/spidb");
const { Employee } = require("./model/spimodel");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Express" });
});

module.exports = router;

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    let sql = "select * from employee where e_username=? and e_password=?";

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);
      let data = [username, encrypted];
      let command = SelectStatement(sql, data);

      Select(command, (err, result) => {
        if (err) console.error("Error: ", err);

        let info = Employee(result);

        if (info.length != 0) {
          info.forEach((user) => {
            req.session.fullname = user.fullname;
            req.session.department = user.department;
            req.session.position = user.position;
            req.session.access = user.access;
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
