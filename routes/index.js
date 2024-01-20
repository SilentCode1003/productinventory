var express = require('express');
const pdfmake = require("pdfmake");
const fs = require("fs");
const path = require("path");

const { Validator } = require('./controller/middleware');
var router = express.Router();
const { Select } = require("./repository/spidb");
const { Deploy } = require("./model/spimodel");
const { Generate } = require("./repository/pdf.js");
const { GetCurrentDate } = require('./repository/customhelper.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  Validator(req, res, "index");
});

module.exports = router;

router.post("/sold", (req, res) => {
  try {
    let sql = `SELECT 
          s_id AS id, 
          s_assetcontrol AS assetcontrol, 
          s_serial AS serial, 
          mi_name AS productname, 
          mc_name AS category, 
          p_status AS status, 
          e_fullname AS soldby, 
          s_date AS date, 
          mip_fobprice AS price,
          s_referenceno AS referenceno
      FROM 
          sold
      INNER JOIN 
          product ON p_assetcontrol = s_assetcontrol AND p_serial = s_serial 
      INNER JOIN 
          master_item ON mi_id = p_itemname
      INNER JOIN 
          master_category ON mc_id = p_category
      INNER JOIN 
          employee ON e_id = s_soldby
      INNER JOIN 
          master_item_price ON mip_itemid = mi_id 
      WHERE 
          YEAR(s_date) = YEAR(CURDATE()) AND MONTH(s_date) = MONTH(CURDATE());`;

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

router.get("/deployed", (req, res) => {
  try {

    let sql = `SELECT 
        d_id,
        d_assetcontrol,
        d_serial,
        d_date,
        e_fullname as d_deployby,
        d_deployto,
        d_referenceno
      FROM deploy
      INNER JOIN employee on e_id = d_deployby
      WHERE 
        YEAR(d_date) = YEAR(CURDATE()) AND MONTH(d_date) = MONTH(CURDATE());`;

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

router.post("/getsoldcount", (req, res) => {
  try {
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
      console.log("Date: ",formattedStartDate, formattedEndDate)
    let sql = `SELECT s_id as id, s_assetcontrol as assetcontrol, s_serial as serial, mi_name as productname, 
              mc_name as category, p_status as status, e_fullname as soldby, s_date as date, mip_fobprice as price
              FROM sold 
              INNER JOIN product on p_assetcontrol = s_assetcontrol and p_serial = s_serial 
              INNER JOIN master_item on mi_id = p_itemname
              INNER JOIN master_category on mc_id = p_category
              INNER JOIN employee on e_id = s_soldby
              INNER JOIN master_item_price on mip_itemid = mi_id 
              WHERE s_date BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`;

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

let pdfBuffer = "";
let filename = "";
let date = "";

router.post("/processpdfdata", (req, res) => {
  try {
    let data = req.body.processeddata;
    let template = req.body.template;
    // console.log("Processed Data: ", data);

    if (data.length != 0 && data != undefined) {
      Generate(data, template)
      .then((result) => {

        pdfBuffer = result;
        filename = template;
        date = GetCurrentDate();

        res.json({
          msg: "success",
          data: result,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.json({
          msg: error,
        });
      });
    }else{
      res.json({
        msg: "nodata",
      });
    }
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.get("/generatepdf", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}_${date}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});