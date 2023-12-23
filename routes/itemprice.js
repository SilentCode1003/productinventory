var express = require("express");
const { Validator } = require("./controller/middleware");
const {
  Select,
  InsertTable,
  SelectParameter,
  Update,
} = require("./repository/spidb");
const {
  MessageStatus,
  JsonDataResponse,
  JsonWarningResponse,
  JsonErrorResponse,
  JsonSuccess,
} = require("./repository/responce");
const { MasterItemPrice, PriceHistory } = require("./model/spimodel");
const { GetValue, ACT, INACT } = require("./repository/dictionary");
const { GetCurrentDatetime } = require("./repository/customhelper");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render('index', { title: 'Express' });
  Validator(req, res, "itemprice");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `select 
    mip_id,
    mi_name as mip_itemid,
    mip_fobprice,
    mip_status,
    mip_createdby,
    mip_createddate
    from master_item_price
    inner join master_item on mi_id = mip_itemid
   `;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      let data = MasterItemPrice(result);
      res.json(JsonDataResponse(data));
    });
  } catch (error) {
    res.json(res.json(JER()));
  }
});

router.post("/save", function (req, res) {
  try {
    const { itemid, fobprice } = req.body;
    let status = GetValue(ACT());
    let createdby =
      req.session.fullname == null ? "1196" : req.session.fullname;
    let createddate = GetCurrentDatetime();
    let master_item_price = [
      [itemid, fobprice, status, createdby, createddate],
    ];

    console.log(master_item_price);

    Check_ItemPrice(itemid, (err, result) => {
      if (err) console.error("Error: ", err);
      let data = MasterItemPrice(result);

      if (data.length != 0) {
        return res.json(JsonWarningResponse(MessageStatus.EXIST));
      } else {
        InsertTable("master_item_price", master_item_price, (err, result) => {
          if (err) console.error("Error:", err);
          console.log(result);
          let price_history = [
            [result[0].id, fobprice, status, createdby, createddate],
          ];

          Insert_PriceHistory(price_history, (err, result) => {
            if (err) console.error("Error:", err);

            console.log(result);
            res.json(JsonSuccess());
          });
        });
      }
    });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});

router.post("/getpricehistory", (req, res) => {
  try {
    const { itempriceid } = req.body;
    let sql = "select * from price_history where ph_itempriceid=?";

    SelectParameter(sql, [itempriceid], (err, result) => {
      if (err) console.error(err);
      let data = PriceHistory(result);

      res.json(JsonDataResponse(data));
    });
  } catch (error) {
    res.json(JsonErrorResponse());
  }
});

router.post("/update", (req, res) => {
  try {
    const { itempriceid, fobprice } = req.body;
    let status = GetValue(ACT());
    let createdby =
      req.session.fullname == null ? "1196" : req.session.fullname;
    let createddate = GetCurrentDatetime();
    let sql = "update master_item_price set mip_fobprice=? where mip_id=?";
    let master_item_price = [fobprice, itempriceid];
    let price_history = [
      [itempriceid, fobprice, status, createdby, createddate],
    ];

    Update(sql, master_item_price, (err, result) => {
      if (err) console.error("Error: ", err);
      console.log(result);
      Insert_PriceHistory(price_history, (err, result) => {
        if (err) console.error("Error:", err);

        console.log(result);
        res.json(JsonSuccess());
      });
    });
  } catch (error) {
    res.json(JsonErrorResponse(error));
  }
});

router.post("/status", (req, res) => {
  try {
    let id = req.body.id;
    let status =
      req.body.status == GetValue(ACT()) ? GetValue(INACT()) : GetValue(ACT());
    let data = [status, id];

    let sql_Update = `UPDATE master_item_price 
                     SET mip_status = ?
                     WHERE mip_id = ?`;

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

//#region Functions
function Check_ItemPrice(itemid, callback) {
  let sql = "select * from master_item_price where mip_itemid=?";

  SelectParameter(sql, [itemid], (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  });
}

function Insert_PriceHistory(price_history, callback) {
  InsertTable("price_history", price_history, (err, result) => {
    if (err) callback(err, null);
    callback(null, result);
  });
}
//#endregion
