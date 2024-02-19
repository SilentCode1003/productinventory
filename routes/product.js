var express = require("express");
var router = express.Router();

const {
  Select,
  InsertTable,
  SelectParameter,
  StoredProcedure,
  SelectResult,
} = require("./repository/spidb");
const {
  Product,
  UploadProduct,
  MasterCategory,
  Return,
  MasterItem,
  Search,
} = require("./model/spimodel");
const {
  GenerateAssetTag,
  convertExcelDate,
  SelectStatement,
} = require("./repository/customhelper");
const { GetValue, WH } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
const { sq, da } = require("date-fns/locale");

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("product", { title: "Express" });
  Validator(req, res, "product");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `
      SELECT 
        p.p_assetcontrol as p_assetcontrol,
        p.p_serial as p_serial,
        mi.mi_name as p_itemname,
        mc.mc_name as p_category,
        p.p_podate as p_podate,
        p.p_ponumber as p_ponumber,
        p.p_warrantydate as p_warrantydate,
        p.p_status as p_status
      FROM 
        product p
      INNER JOIN 
        master_item mi ON p.p_itemname = mi.mi_id
      INNER JOIN 
        master_category mc ON p.p_category = mc.mc_id;
    `;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {
        let data = Product(result);

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

router.get("/getproductstatus", (req, res) => {
  try {
    let sql = `SELECT DISTINCT p_status as status FROM product`;

    SelectResult(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {
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

router.post("/getProductbyCategory", (req, res) => {
  try {
    let {category, status} = req.body;
    let sql = `SELECT * FROM product WHERE p_category = '${category}' AND p_status = '${status}'`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);
      let product = Product(result);
      
      if (result.length != 0) {
        // console.log(data);
        res.json({
          msg: "success",
          data: product,
        });
      } else {
        console.log(sql)
        res.json({
          msg: "NODATA",
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

router.get("/getstocks", (req, res) => {
  try {
    let sql = `
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
        product p
      INNER JOIN
        master_item  ON p_itemname = mi_id
      INNER JOIN
        master_category mc ON p_category = mc_id
      INNER JOIN
        master_item_price ON  mip_itemid = p_itemname
      WHERE p_status in ('WAREHOUSE', 'RETURNED');`;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {

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

router.get("/loadproduct", (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = 500;
    const offset = (page - 1) * itemsPerPage;

    let sql = `
      SELECT 
        p.p_assetcontrol as p_assetcontrol,
        p.p_serial as p_serial,
        mi.mi_name as p_itemname,
        mc.mc_name as p_category,
        p.p_podate as p_podate,
        p.p_ponumber as p_ponumber,
        p.p_warrantydate as p_warrantydate,
        p.p_status as p_status
      FROM 
        product p
      INNER JOIN 
        master_item mi ON p.p_itemname = mi.mi_id
      INNER JOIN 
        master_category mc ON p.p_category = mc.mc_id
      ORDER BY p.p_podate DESC
      LIMIT ${itemsPerPage} OFFSET ${offset};
    `;

    Select(sql, (err, result) => {
      if (err) console.error("Error: ", err);

      if (result.length != 0) {
        let data = Product(result);

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
    const { serial, itemname, category, podate, ponumber, warrantydate } =
      req.body;
    let sequence = 1;
    let status = GetValue(WH());

    // console.log(serial);

    Product_Check(serial)
      .then((result) => {
        if (result[0].total != 0) {
          res.json({
            msg: "exist",
          });
        } else {
          Product_Count()
            .then((result) => {
              sequence = parseInt((result[0].total += 1));

              let product = [
                [
                  GenerateAssetTag(category, sequence),
                  serial,
                  itemname,
                  category,
                  podate,
                  ponumber,
                  warrantydate,
                  status,
                ],
              ];
              InsertTable("product", product, (err, result) => {
                if (err) console.error("Error: ", err);
                console.log(result);
                res.json({
                  msg: "success",
                });
              });
            })
            .catch((error) => {
              return res.json({
                msg: error,
              });
            });
        }
      })
      .catch((error) => {
        return res.json({
          msg: error,
        });
      });
  } catch (error) {
    return res.json({
      msg: error,
    });
  }
});

router.post("/getserial", (req, res) => {
  try {
    const { assetcontrol } = req.body;
    let sql = "select * from product where p_assetcontrol=?";

    SelectParameter(sql, [assetcontrol], (err, result) => {
      if (err) console.error("Error: ", err);
      let data = Product(result);
      console.log(result);

      res.json({
        msg: "success",
        data: {
          serial: data[0].serial,
        },
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

router.post("/getassetcontrol", (req, res) => {
  try {
    const { serial } = req.body;
    let sql = "select * from product where p_serial=?";

    SelectParameter(sql, [serial], (err, result) => {
      if (err) console.error("Error: ", err);
      let data = Product(result);
      console.log(result);

      res.json({
        msg: "success",
        data: {
          assetcontrol: data[0].assetcontrol,
        },
      });
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
    let dataJSon = UploadProduct(JSON.parse(data));
    let status = GetValue(WH());
    let counter = 0;
    let sequence = 0;
    let product = [];
    let notexist = [];
    let notice = [];

    // console.log(dataJSon);
    Product_Count()
      .then((result) => {
        // console.log(result);
        console.log("Data Length:", dataJSon.length)
        sequence = parseInt(result[0].total);
        dataJSon.forEach((item) => {
          Product_Check(item.serial)
            .then((result) => {
              // console.log(result);
              if (result != undefined || result != null) {
                if (result[0].total != 0) {
                  counter += 1;
                  notice.push("SERIAL_"+item.serial + '_DUPLICATE_ENTRY')
                  console.log("SERIAL_"+item.serial + '_DUPLICATE_ENTRY')
                  console.log("counter:", counter);
                  uploadProduct();
                } else {
                  Get_Category(item.category)
                    .then((result) => {
                      if (result.length != 0) {
                        // console.log(result);
                        let category = MasterCategory(result);
                        let categoryid = category[0].id;
                        Get_Item(item.itemname, categoryid)
                          .then((result) => {
                            if (result.length != 0) {
                              let dataitems = MasterItem(result);
                              console.log("item names data: ", dataitems);
                              let itemid = dataitems[0].id;

                              counter += 1;
                              sequence += 1;

                              console.log(
                                "sequence: ",
                                sequence,
                                "counter: ",
                                counter,
                                "item serial: ",
                                item.serial,
                                "Data Length: ",
                                dataJSon.length
                              );

                              product.push([
                                GenerateAssetTag(categoryid, sequence),
                                item.serial,
                                itemid,
                                categoryid,
                                convertExcelDate(item.podate),
                                item.ponumber,
                                convertExcelDate(item.warrantydate),
                                status,
                              ]);
                              uploadProduct();
                              // console.log(product);
                            } else {
                              counter += 1;
                              notice.push("SERIAL_"+item.serial + '_INVALID_ITEM_NAME_('+item.itemname+")")
                              console.log("SERIAL_"+item.serial + '_INVALID_ITEM_NAME_('+item.itemname+")")
                              console.log("counter:", counter);
                              uploadProduct();
                            }
                          })
                          .catch((error) => {
                            console.log("Get Items: ", error);
                            res.json({
                              msg: error,
                            });
                          });
                      } else {
                        counter += 1;
                        notice.push("SERIAL_"+item.serial + "_INVALID_CATEGORY_("+ item.category +")")
                        console.log("SERIAL_"+item.serial + "_INVALID_CATEGORY_("+ item.category +")")
                        console.log("counter:", counter)
                        uploadProduct();
                      }
                    })
                    .catch((error) => {
                      console.log("Get Category: ", error);
                      return res.json({
                        msg: error,
                      });
                    });
                }
              } else {
                counter += 1;
                notexist.push(item.serial)
                uploadProduct();
              }

              // if (counter == dataJSon.length) {
              //   console.log("Duplicate!");
              //   console.log("counter measures:", notice)
              //   if (duplicate != "") {
              //     return res.json({
              //       msg: "exist",
              //       data: duplicate,
              //     });
              //   }
              // }

              function uploadProduct(){
                if (counter == dataJSon.length) {
                  console.log(product);
                  if(product.length != 0){
                    InsertTable("product", product, (err, result) => {
                      if (err) console.error("Error: ", err);
                      console.log(result);
                    });
                  }else{
                    console.log("NO DATA PUSHED");
                  }
                  if (notice != 0) {
                    return res.json({
                      msg: "notice",
                      data: notice,
                    });
                  } else {
                    return res.json({
                      msg: "success",
                    });
                  }
                }
              }
            })
            .catch((error) => {
              console.log("Product Check: ", error);
              return res.json({
                msg: error,
              });
            });
        });
      })
      .catch((error) => {
        console.log("Product Count: ", error);
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

router.post("/search", (req, res) => {
  try {
    const { keyword } = req.body;
    
    let sql = `select
    p_assetcontrol as assetcontrol,
    mc_name as category,
    mi_name as itemname,
    p_serial as serial,
    p_podate as podate,
    p_ponumber as ponumber,
    p_warrantydate as warrantydate,
    p_status as status,
    transfer.t_date as transferdate,
    transfer.t_transferby as transferby,
    transfer.t_to transferto,
    transfer.t_receiveby as transferby,
    transfer.t_from as transferfrom,
    transfer.t_referenceno as transferreferenceno,
    deploy.d_date as deploydate,
    deploy.d_deployby as deployby,
    deploy.d_deployto as deployto,
    deploy.d_referenceno as deployreferenceno,
    repair.r_date as repairdate,
    repair.r_repairby as repairby,
    repair.r_referenceno as repairreferenceno,
    returnitem.r_date as returndate,
    returnitem.r_returnby as returnby,
    returnitem.r_returnfrom as returnfrom,
    sold.s_date as solddate,
    sold.s_soldby as soldby,
    sold.s_soldto as soldto,
    sold.s_referenceno as soldreferenceno
    from product
    inner join master_category on mc_id = p_category
    inner join master_item on mi_id = p_itemname
    left join transfer on p_serial = t_serial
    left join deploy on p_serial = d_serial
    left join returnitem on p_serial = returnitem.r_serial
    left join repair on p_serial = repair.r_serial
    left join sold on p_serial = s_serial
    where p_serial like ? 
    or p_assetcontrol like ?
    or p_itemname like ?`;
    let command = SelectStatement(sql, [`${keyword}%`, `${keyword}%`, `${keyword}%`]);

    Select(command, (err, result) => {
      if (err) console.error("Error: ", err);
      let data = Search(result);
      if (data.length != 0) {
        let data = Search(result);

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

router.post("/producthistory", (req, res) => {
  try {
    const { assetcontrol } = req.body;
    let sql = "call cyberpowerproduct.getproducthistory(?)";

    StoredProcedure(sql, assetcontrol, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);
      res.json({
        msg: "success",
        data: result,
      });
    });
  } catch (error) {
    res.json({
      msg: error,
    });
  }
});

//#region Functions
function Product_Count() {
  return new Promise((resolve, reject) => {
    let sql = "select count(*) as total from product";
    Select(sql, (err, result) => {
      if (err) reject(err);

      // console.log(result);

      resolve(result);
    });
  });
}

function Product_Check(serial) {
  return new Promise((resolve, reject) => {
    let sql = "select count(*) as total from product where p_serial=?";

    SelectParameter(sql, [serial], (err, result) => {
      if (err) reject(err);

      // console.log(result);
      resolve(result);
    });
  });
}

function Get_Category(name) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_category where mc_name=?";
    SelectParameter(sql, [name], (err, result) => {
      if (err) reject(err);
      // console.log(result);
      resolve(result);
    });
  });
}

function Get_Item(name, category) {
  return new Promise((resolve, reject) => {
    let sql = "select * from master_item where mi_name=? and mi_category=?";
    let command = SelectStatement(sql, [name, category]);
    Select(command, (err, result) => {
      if (err) reject(err);

      // console.log(result);

      resolve(result);
    });
  });
}

//#endregion