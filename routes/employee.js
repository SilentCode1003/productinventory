var express = require("express");
const {
  SelectParameter,
  Select,
  InsertTable,
  Update,
} = require("./repository/spidb");
const {
  Employee,
  EmployeeUpload,
  MasterDepartment,
  MasterPosition,
  MasterAccess,
} = require("./model/spimodel");
const { GetValue, ACT } = require("./repository/dictionary");
const { GetCurrentDatetime } = require("./repository/customhelper");
const { Encrypter } = require("./repository/cryptography");
const { Validator } = require("./controller/middleware");
const { JsonErrorResponse, JsonSuccess } = require("./repository/responce");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("employee", { title: "Express" });
  Validator(req, res, "employee");
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
      // console.log(result);
      if (result.length != 0) {
        let data = Employee(result);
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
    const { fullname, username, password, position, department, access } =
      req.body;
    let status = GetValue(ACT());
    let createdby =
      req.session.fullname == null ? "creator" : req.session.fullname;
    let createddate = GetCurrentDatetime();

    Encrypter(password, (err, encrypted) => {
      if (err) console.error("Error: ", err);

      console.log(encrypted);

      Check_Employee(fullname)
        .then((result) => {
          let data = Employee(result);

          if (data.length != 0) {
            return res.json({
              msg: "exist",
            });
          } else {
            let employee = [
              [
                fullname,
                position,
                department,
                username,
                encrypted,
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
          }
        })
        .catch(() => {});
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
    let dataJson = EmployeeUpload(JSON.parse(data));
    let _employee = [];
    let _counter = 0;
    let _dupentry = [];
    let message = "";

    dataJson.forEach((employee) => {
      let user = `${employee.firstname[0]}${employee.lastname}`;
      Encrypter(user, (err, encrypted) => {
        if (err) console.error(err);

        GetDepartment(employee.department)
          .then((result) => {
            let _department = MasterDepartment(result);
            let departmentid = _department[0].id;
            GetPosition(employee.position)
              .then((result) => {
                let _position = MasterPosition(result);
                let positionid = _position[0].id;

                GetAccesss(employee.access)
                  .then((result) => {
                    let _access = MasterAccess(result);
                    let accessid = _access[0].id;
                    let status = GetValue(ACT());
                    let createdby = req.session.fullname;
                    let createddate = GetCurrentDatetime();
                    let fullname = `${employee.firstname} ${employee.lastname}`;

                    Check_Employee(fullname)
                      .then((result) => {
                        let check_employee = Employee(result);
                        _counter += 1;

                        if (check_employee != 0) {
                          _dupentry.push(fullname);
                        } else {
                          _employee.push([
                            fullname,
                            positionid,
                            departmentid,
                            user,
                            encrypted,
                            accessid,
                            status,
                            createdby,
                            createddate,
                          ]);
                        }

                        console.log(
                          "Counter: ",
                          _counter,
                          "Data Length: ",
                          dataJson.length
                        );
                        if (_counter == dataJson.length) {
                          if (_employee != 0) {
                            InsertTable(
                              "employee",
                              _employee,
                              (err, result) => {
                                if (err) console.error("Error: ", err);

                                console.log(result);
                              }
                            );
                          } else {
                            message += "dupentry";
                          }

                          if (message != "") {
                            return res.json({
                              msg: message,
                              data: {
                                dupentry: _dupentry,
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
                        console.log(error);
                        return res.json({
                          msg: error,
                        });
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    return res.json({
                      msg: error,
                    });
                  });
              })
              .catch((error) => {
                console.log(error, employee.position);
                return res.json({
                  msg: error,
                });
              });
          })
          .catch((error) => {
            console.log(employee.department);
            console.log(error);
            return res.json({
              msg: error,
            });
          });
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
    const { employeeid, position, access, department } = req.body;

    let data = [];
    let sql_update = "update employee set";

    if (position) {
      sql_update += " e_position=?,";
      data.push(position);
    }
    if (department) {
      sql_update += " e_department=?,";
      data.push(department);
    }
    if (access) {
      sql_update += " e_access=?,";
      data.push(access);
    }

    sql_update = sql_update.slice(0, -1);
    sql_update += " where e_id=?";

    Update(sql_update, data, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);
      res.json(JsonSuccess());
    });

    data.push(employeeid);
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});

//#region Function
function Check_Employee(fullname) {
  return new Promise((resolve, reject) => {
    let sql = "select * from employee where e_fullname=?";
    SelectParameter(sql, [fullname], (err, result) => {
      if (err) reject(err);
      console.log(result);

      resolve(result);
    });
  });
}

function GetDepartment(name) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_department where md_name=?";

    SelectParameter(sql, [name], (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}

function GetPosition(name) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_position where mp_name=?";

    SelectParameter(sql, [name], (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}

function GetAccesss(name) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_access where ma_name=?";

    SelectParameter(sql, [name], (err, result) => {
      if (err) reject(err);

      resolve(result);
    });
  });
}
//#endregion
