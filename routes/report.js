var express = require("express");
const { Validator } = require("./controller/middleware");
var router = express.Router();
const { JsonErrorResponse, JsonSuccess } = require("./repository/responce");
const { GeneratePDF } = require("./repository/pdf");
const { SalesReport, SalesReportHistory } = require("./model/spimodel");
const {
  Update,
  Select,
  InsertTable,
  SelectParameter,
  SelectResult,
} = require("./repository/spidb");
const { SelectStatement, ConvertDate } = require("./repository/customhelper");

router.get("/", function (req, res, next) {
  // res.render("report", { title: "Express" });
  Validator(req, res, "report");
});

module.exports = router;

router.get("/pdf", (req, res) => {
  try {
    GeneratePDF()
      .then((result) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=Sales_Report.pdf"
        );

        res.send(result);
      })
      .catch((error) => {
        console.log(error);
        res.json(JsonErrorResponse(error));
      });
  } catch (error) {
    console.log(error);
    res.json(JsonErrorResponse(error));
  }
});

router.post("/salesreport", (req, res) => {
  try {
    let referenceno = req.body.referenceno;
    let sql = `SELECT 
            sr_id AS id, mc_name AS category, mi_name as item, sr_date as date,sr_quantity as quantity, sr_sellingprice as sellingprice,
            e_fullname as soldby, sr_soldto as soldto ,sr_paymenttype as paymenttype, sr_soldrefno as soldrefno, 
            sr_referenceno as transacrefno, sr_remarks as remarks, sr_status as status, sr_deliveryfee as deliveryfee
          FROM sales_report
          INNER JOIN master_item ON sr_item = mi_id
          INNER JOIN master_category ON sr_category = mc_id
          INNER JOIN employee ON sr_soldby = e_id
          WHERE sr_soldrefno = '${referenceno}';`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      // console.log("Data: ", result);

      if (result.length != 0) {
        // let data = SalesReport(result);

        // console.log(data);
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

router.get("/salesreporthistory", (req, res) => {
  try {
    let sql = `select * from sales_report_history`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      // console.log("Data: ", result);

      if (result.length != 0) {
        let data = SalesReportHistory(result);

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

router.post("/historydetails", (req, res) => {
  try {
    let id = req.body.id;
    let sql = `select * from sales_report_history WHERE srh_id = '${id}'`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      // console.log("Data: ", result);

      if (result.length != 0) {
        let data = SalesReportHistory(result);

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

router.post("/updatehistory", (req, res) => {
  try {
    const { details, documents, id, status, referenceno } = req.body;
    // console.log(details, documents, id, status);
    let data = [];
    let sql_update = "update sales_report_history set";

    if (documents) {
      sql_update += " srh_documents=?,";
      data.push(JSON.stringify(documents));
    }
    if (details) {
      sql_update += " srh_date=?,";
      data.push(JSON.stringify(details));
    }
    if (status) {
      sql_update += " srh_status=?,";
      data.push(status);
    }

    sql_update = sql_update.slice(0, -1);
    sql_update += " where srh_id=?";

    data.push(id);

    // console.log(sql_update)

    Update(sql_update, data, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);
      select_sales_product = `SELECT * FROM sales_report WHERE sr_soldrefno = '${referenceno}'`;
      Select(select_sales_product, (err, result) => {
        if (err) console.error("Error: ", err);
        let salesreport = SalesReport(result);

        salesreport.forEach((item) => {
          let id = item.id;
          let sales_report_update =
            "update sales_report set sr_status=? where sr_id=?";
          let report_update = [status, id];
          console.log(
            "ID: ",
            id,
            " Update Data: ",
            sales_report_update,
            report_update
          );
          Update(sales_report_update, report_update, (err, result) => {
            if (err) console.error("Error: ", err);
          });
        });
      });

      res.json(JsonSuccess());
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/getsalesreport", (req, res) => {
  try {
    let soldby = req.body.soldby;
    let daterange = req.body.daterange;
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

    // console.log("Date: ", formattedStartDate, formattedEndDate, "Sold By: ", soldby)

    let sql = `SELECT sr_date as date, sr_soldrefno as soldrefno,  mc_name as category, mi_name as itemname, 
                sr_sellingprice as price, sr_quantity as quantity, sr_paymenttype as paymenttype, 
                sr_referenceno as transacrefno, sr_status as status, sr_deliveryfee as deliveryfee
              FROM cyberpowerproduct.sales_report
              INNER JOIN master_item ON sr_item = mi_id
              INNER JOIN master_category ON sr_category = mc_id
              INNER JOIN employee ON sr_soldby = e_id
              WHERE e_fullname = '${soldby}' and sr_date BETWEEN '${formattedStartDate}' AND '${formattedEndDate}';`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      if (result.length != 0) {
        // console.log(sql);
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

router.post("/summary", (req, res) => {
  const { dateRange } = req.body;
  const [startDate, endDate] = dateRange.split(" - ");
  const formattedStartDate = ConvertDate(startDate);
  const formattedEndDate = ConvertDate(endDate);
  try {
    const sql = `
      SELECT
        p_assetcontrol as assetcontrol,
        p_serial as serial,
        mi_name as itemname,
        mc_name as category,
        p_podate as podate,
        p_ponumber as ponumber,
        p_warrantydate as warrantydate,
        p_status as status,
        mip_fobprice as price
      FROM
        product
      INNER JOIN
        master_item  ON p_itemname = mi_id
      INNER JOIN
        master_category mc ON p_category = mc_id
      INNER JOIN
        master_item_price ON  mip_itemid = p_itemname
      WHERE p_status in ('WAREHOUSE', 'RETURNED');`;

    const selectSold = `SELECT mi_name AS itemName, mc_name AS category FROM sold 
      INNER JOIN product ON s_assetcontrol = p_assetcontrol
      INNER JOIN master_category ON p_category = mc_id
      INNER JOIN master_item ON p_itemname = mi_id
      WHERE s_date BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`;

    const selectDeffective = `SELECT mi_name AS itemName, mc_name AS category FROM deffectiveitem 
      INNER JOIN product ON d_assetcontrol = p_assetcontrol
      INNER JOIN master_category ON p_category = mc_id
      INNER JOIN master_item ON p_itemname = mi_id
      WHERE d_date BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      if (result.length != 0) {
        let groupedData = groupDataByItemName(result);

        SelectResult(selectSold, (err, result) => {
          if (err) console.error("Error: ", err);
          if (result.length != 0) {
            const soldData = result;

            updateSold(groupedData, soldData);

            SelectResult(selectDeffective, (err, result) => {
              if (err) console.error("Error: ", err);
              if (result.length != 0) {
                const deffectiveData = result;

                updateDeffective(groupedData, deffectiveData);

                res.json({
                  msg: "success",
                  data: groupedData,
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/adddocuments", (req, res) => {
  try {
    let { id, documents } = req.body;

    Check_History(id)
      .then((result) => {
        let historydata = SalesReportHistory(result);
        let existingDocuments = [];

        if (historydata[0].documents != "N/A") {
          existingDocuments = JSON.parse(historydata[0].documents);
          existingDocuments.push(...documents);
          console.log(id, documents);

          console.log(existingDocuments);

          if (historydata.length != 1) {
            return res.json({
              msg: "notexist",
            });
          } else {
            let history_update =
              "update sales_report_history set srh_documents=? where srh_id=?";
            let history_data = [JSON.stringify(existingDocuments), id];

            console.log(history_data);

            Update(history_update, history_data, (err, result) => {
              if (err) console.error("Error: ", err);
              return res.json({
                msg: "success",
              });
            });
          }
        } else {
          let history_update =
            "update sales_report_history set srh_documents=? where srh_id=?";
          let history_data = [JSON.stringify(documents), id];

          Update(history_update, history_data, (err, result) => {
            if (err) console.error("Error: ", err);
            return res.json({
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

function Check_History(id) {
  return new Promise((resolve, reject) => {
    let sql = "select * from sales_report_history where srh_id=?";
    let command = SelectStatement(sql, [id]);

    Select(command, (err, result) => {
      if (err) reject(err);

      console.log(result);

      resolve(result);
    });
  });
}

function groupDataByItemName(data) {
  const groupedData = {};
  data.forEach((item) => {
    const itemName = item.itemname;
    groupedData[itemName] = groupedData[itemName] || {
      category: item.category,
      stocks: 0,
      sold: 0,
      deffective: 0,
      // totalPrice: 0,
    };
    groupedData[itemName].stocks += 1;
    // groupedData[itemName].totalPrice += item.price;
  });

  return groupedData;
}

function updateSold(inventory, soldData) {
  soldData.forEach((item) => {
    const { itemName, category } = item;
    console.log(inventory[itemName]);
    if (inventory[itemName]) {
      inventory[itemName].sold += 1;
    }
  });
}

function updateDeffective(inventory, deffectiveData) {
  deffectiveData.forEach((item) => {
    const { itemName, category } = item;
    console.log(inventory[itemName]);
    if (inventory[itemName]) {
      inventory[itemName].deffective += 1;
    }
  });
}
