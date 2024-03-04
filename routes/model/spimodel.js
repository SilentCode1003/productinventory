const {
  MasterItemModel,
  MasterCategoryModel,
  EmployeeModel,
  ProductModel,
  DeployModel,
  ReturnModel,
  TransferModel,
  SoldModel,
  MasterDepartmentModel,
  MasterAccessModel,
  MasterPositionModel,
  MasterClientModel,
  RepairModel,
  ProductUploadModel,
  TransferProductModel,
  SearchModel,
  DeployProductModel,
  EmployeeUploadModel,
  MasterItemPriceModel,
  PriceHistoryModel,
  SoldProductModel,
  RepairProductModel,
  ReplaceItemModel,
  DeffectiveItemModel,
  ReturnProductModel,
  UploadItemPriceModel,
  UploadDefectiveItemModel,
  UploadReplaceItemModel,
  SalesReportModel,
  SalesReportHistoryModel,
  UploadSalesHistoryModel,
} = require("./model");

exports.MasterItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.mi_id,
      name: key.mi_name,
      category: key.mi_category,
      status: key.mi_status,
      createdby: key.mi_createdby,
      createddate: key.mi_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterItemModel(
        key["id"],
        key["name"],
        key["category"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.MasterCategory = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.mc_id,
      name: key.mc_name,
      status: key.mc_status,
      createdby: key.mc_createdby,
      createddate: key.mc_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterCategoryModel(
        key["id"],
        key["name"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.Employee = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.e_id,
      fullname: key.e_fullname,
      position: key.e_position,
      department: key.e_department,
      username: key.e_username,
      password: key.e_password,
      access: key.e_access,
      status: key.e_status,
      createdby: key.e_createdby,
      createddate: key.e_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new EmployeeModel(
        key["id"],
        key["fullname"],
        key["position"],
        key["department"],
        key["username"],
        key["password"],
        key["access"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.Product = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      assetcontrol: key.p_assetcontrol,
      serial: key.p_serial,
      itemname: key.p_itemname,
      category: key.p_category,
      podate: key.p_podate,
      ponumber: key.p_ponumber,
      warrantydate: key.p_warrantydate,
      status: key.p_status,
    });
  });

  return dataResult.map(
    (key) =>
      new ProductModel(
        key["assetcontrol"],
        key["serial"],
        key["itemname"],
        key["category"],
        key["podate"],
        key["ponumber"],
        key["warrantydate"],
        key["status"]
      )
  );
};

exports.Deploy = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.d_id,
      assetcontrol: key.d_assetcontrol,
      serial: key.d_serial,
      date: key.d_date,
      deployby: key.d_deployby,
      deployto: key.d_deployto,
      referenceno: key.d_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new DeployModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["deployby"],
        key["deployto"],
        key["referenceno"]
      )
  );
};

exports.Return = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.r_id,
      assetcontrol: key.r_assetcontrol,
      serial: key.r_serial,
      date: key.r_date,
      returnby: key.r_returnby,
      returnfrom: key.r_returnfrom,
      referenceno: key.r_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new ReturnModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["returnby"],
        key["returnfrom"],
        key["referenceno"]
      )
  );
};

exports.Sold = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.s_id,
      assetcontrol: key.s_assetcontrol,
      serial: key.s_serial,
      date: key.s_date,
      soldby: key.s_soldby,
      soldto: key.s_soldto,
      referenceno: key.s_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new SoldModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["soldby"],
        key["soldto"],
        key["referenceno"]
      )
  );
};

exports.Transfer = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.t_id,
      assetcontrol: key.t_assetcontrol,
      serial: key.t_serial,
      date: key.t_date,
      transferby: key.t_transferby,
      from: key.t_from,
      receiveby: key.t_receiveby,
      to: key.t_to,
      referenceno: key.t_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new TransferModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["transferby"],
        key["from"],
        key["receiveby"],
        key["to"],
        key["referenceno"]
      )
  );
};

exports.MasterDepartment = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.md_id,
      name: key.md_name,
      status: key.md_status,
      createdby: key.md_createdby,
      createddate: key.md_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterDepartmentModel(
        key["id"],
        key["name"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.MasterAccess = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.ma_id,
      name: key.ma_name,
      status: key.ma_status,
      createdby: key.ma_createdby,
      createddate: key.ma_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterAccessModel(
        key["id"],
        key["name"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.MasterPosition = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.mp_id,
      name: key.mp_name,
      status: key.mp_status,
      createdby: key.mp_createdby,
      createddate: key.mp_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterPositionModel(
        key["id"],
        key["name"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.MasterClient = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.mc_id,
      branch: key.mc_branch,
      company: key.mc_company,
      status: key.mc_status,
      createdby: key.mc_createdby,
      createddate: key.mc_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterClientModel(
        key["id"],
        key["branch"],
        key["company"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.Repair = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.r_id,
      assetcontrol: key.r_assetcontrol,
      serial: key.r_serial,
      date: key.r_date,
      repairby: key.r_repairby,
      referenceno: key.r_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new RepairModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["repairby"],
        key["referenceno"]
      )
  );
};

exports.MasterItemPrice = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.mip_id,
      itemid: key.mip_itemid,
      fobprice: key.mip_fobprice,
      status: key.mip_status,
      createdby: key.mip_createdby,
      createddate: key.mip_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new MasterItemPriceModel(
        key["id"],
        key["itemid"],
        key["fobprice"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.PriceHistory = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.ph_id,
      itempriceid: key.ph_itempriceid,
      fobprice: key.ph_fobprice,
      status: key.ph_status,
      createdby: key.ph_createdby,
      createddate: key.ph_createddate,
    });
  });

  return dataResult.map(
    (key) =>
      new PriceHistoryModel(
        key["id"],
        key["itempriceid"],
        key["fobprice"],
        key["status"],
        key["createdby"],
        key["createddate"]
      )
  );
};

exports.ReplaceItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.r_id,
      assetcontrol: key.r_assetcontrol,
      itemserial: key.r_itemserial,
      replacedserial: key.r_replacedserial,
      remarks: key.r_remarks,
      date: key.r_date,
      replacedby: key.r_replacedby,
      referenceno: key.r_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new ReplaceItemModel(
        key["id"],
        key["assetcontrol"],
        key["itemserial"],
        key["replacedserial"],
        key["remarks"],
        key["date"],
        key["replacedby"],
        key["referenceno"]
      )
  );
};

exports.DeffectiveItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.d_id,
      assetcontrol: key.d_assetcontrol,
      itemserial: key.d_itemserial,
      remarks: key.d_remarks,
      date: key.d_date,
      referenceno: key.d_referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new DeffectiveItemModel(
        key["id"],
        key["assetcontrol"],
        key["itemserial"],
        key["remarks"],
        key["date"],
        key["referenceno"]
      )
  );
};

//#region Upload Models

exports.UploadProduct = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      category: key.category,
      itemname: key.itemname,
      serial: key.serial,
      podate: key.podate,
      ponumber: key.ponumber,
      warrantydate: key.warrantydate,
    });
  });

  return dataResult.map(
    (key) =>
      new ProductUploadModel(
        key["category"],
        key["itemname"],
        key["serial"],
        key["podate"],
        key["ponumber"],
        key["warrantydate"]
      )
  );
};

exports.TransferProduct = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      serial: key.serial,
      date: key.date,
      transferby: key.transferby,
      from: key.from,
      receivedby: key.receivedby,
      to: key.to,
      referenceno: key.referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new TransferProductModel(
        key["serial"],
        key["date"],
        key["transferby"],
        key["from"],
        key["receivedby"],
        key["to"],
        key["referenceno"]
      )
  );
};

exports.DeployProduct = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      serial: key.serial,
      date: key.date,
      deployby: key.deployby,
      deployto: key.deployto,
      referenceno: key.referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new DeployProductModel(
        key["serial"],
        key["date"],
        key["deployby"],
        key["deployto"],
        key["referenceno"]
      )
  );
};

exports.EmployeeUpload = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      lastname: key.lastname,
      middlename: key.middlename,
      firstname: key.firstname,
      department: key.department,
      position: key.position,
      access: key.access,
    });
  });

  return dataResult.map(
    (key) =>
      new EmployeeUploadModel(
        key["lastname"],
        key["middlename"],
        key["firstname"],
        key["department"],
        key["position"],
        key["access"]
      )
  );
};

exports.SoldProduct = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      serial: key.serial,
      date: key.date,
      company: key.company,
      branch: key.branch,
      soldby: key.soldby,
      referenceno: key.referenceno,
      sellingprice: key.sellingprice,
      paymenttype: key.paymenttype,
      deliveryfee: key.deliveryfee,
      transactionref: key.transactionref,
      transactionstatus: key.transactionstatus,
      remarks: key.remarks,
    });
  });

  return dataResult.map(
    (key) =>
      new SoldProductModel(
        key["serial"],
        key["date"],
        key["company"],
        key["branch"],
        key["soldby"],
        key["referenceno"],
        key["sellingprice"],
        key["paymenttype"],
        key["deliveryfee"],
        key["transactionref"],
        key["transactionstatus"],
        key["remarks"],
      )
  );
};

exports.RepairProduct = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      serial: key.serial,
      date: key.date,
      repairby: key.repairby,
      referenceno: key.referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new RepairProductModel(
        key["serial"],
        key["date"],
        key["repairby"],
        key["referenceno"]
      )
  );
};

exports.ReturnProduct = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      serial: key.serial,
      date: key.date,
      returnby: key.returnby,
      returnfrom: key.returnfrom,
      referenceno: key.referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new ReturnProductModel(
        key["serial"],
        key["date"],
        key["returnby"],
        key["returnfrom"],
        key["referenceno"]
      )
  );
};

exports.SalesReport = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.sr_id,
      category: key.sr_category,
      item: key.sr_item,
      date: key.sr_date,
      quantity: key.sr_quantity,
      sellingprice: key.sr_sellingprice,
      deliveryfee: key.sr_deliveryfee,
      soldby: key.sr_soldby,
      soldto: key.sr_soldto,
      paymenttype: key.sr_paymenttype,
      soldrefno: key.sr_soldrefno,
      referenceno: key.sr_referenceno,
      remarks: key.sr_remarks,
      status: key.sr_status,
      assetcontrol: key.sr_assetcontrol,
    });
  });

  return dataResult.map(
    (key) =>
      new SalesReportModel(
        key["id"],
        key["category"],
        key["item"],
        key["date"],
        key["quantity"],
        key["sellingprice"],
        key["deliveryfee"],
        key["soldby"],
        key["soldto"],
        key["paymenttype"],
        key["soldrefno"],
        key["referenceno"],
        key["remarks"],
        key["status"],
      )
  );
};

exports.SalesReportHistory = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.srh_id,
      date: key.srh_date,
      ramarks: key.srh_remarks,
      status: key.srh_status,
      referenceno: key.srh_referenceno,
      documents: key.srh_documents,
    });
  });

  return dataResult.map(
    (key) =>
      new SalesReportHistoryModel(
        key["id"],
        key["date"],
        key["ramarks"],
        key["status"],
        key["referenceno"],
        key["documents"]
      )
  );
};

exports.UploadItemPrice = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      category: key.category,
      itemname: key.itemname,
      fobprice: key.fobprice,
    });
  });

  return dataResult.map(
    (key) =>
      new UploadItemPriceModel(
        key["category"],
        key["itemname"],
        key["fobprice"]
      )
  );
};

exports.UploadDefectiveItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      assetcontrol: key.assetcontrol,
      itemserial: key.itemserial,
      remarks: key.remarks,
      date: key.date,
      referenceno: key.referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new UploadDefectiveItemModel(
        key["assetcontrol"],
        key["itemserial"],
        key["remarks"],
        key["date"],
        key["referenceno"],
      )
  );
};

exports.UploadReplaceItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      itemserial: key.itemserial,
      replacedserial: key.replacedserial,
      remarks: key.remarks,
      date: key.date,
      replacedby: key.replacedby,
      referenceno: key.referenceno,
      replacementmode: key.replacementmode,
    });
  });

  return dataResult.map(
    (key) =>
      new UploadReplaceItemModel(
        key["itemserial"],
        key["replacedserial"],
        key["remarks"],
        key["date"],
        key["replacedby"],
        key["referenceno"],
        key["replacementmode"],
      )
  );
};

exports.UploadSalesHistory = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      salesreportid: key.salesreportid,
      date: key.date,
      remarks: key.remarks,
      status: key.status,
      referenceno: key.referenceno,
      documents: key.documents,
    });
  });

  return dataResult.map(
    (key) =>
      new UploadSalesHistoryModel(
        key["salesreportid"],
        key["date"],
        key["remarks"],
        key["status"],
        key["referenceno"],
        key["documents"],
      )
  );
};

//#endregion

//#region Search
exports.Search = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      assetcontrol: key.assetcontrol,
      category: key.category,
      itemname: key.itemname,
      serial: key.serial,
      podate: key.podate,
      ponumber: key.ponumber,
      warrantydate: key.warrantydate,
      status: key.status,
      transferdate: key.transferdate,
      transferby: key.transferby,
      transferto: key.transferto,
      transferfrom: key.transferfrom,
      transferreferenceno: key.transferreferenceno,
      deploydate: key.deploydate,
      deployby: key.deployby,
      deployto: key.deployto,
      deployreferenceno: key.deployreferenceno,
      repairdate: key.repairdate,
      repairby: key.repairby,
      repairreferenceno: key.repairreferenceno,
      returndate: key.returndate,
      returnby: key.returnby,
      returnfrom: key.returnfrom,
      solddate: key.solddate,
      soldby: key.soldby,
      soldto: key.soldto,
      soldreferenceno: key.soldreferenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new SearchModel(
        key["assetcontrol"],
        key["category"],
        key["itemname"],
        key["serial"],
        key["podate"],
        key["ponumber"],
        key["warrantydate"],
        key["status"],
        key["transferdate"],
        key["transferby"],
        key["transferto"],
        key["transferfrom"],
        key["transferreferenceno"],
        key["deploydate"],
        key["deployby"],
        key["deployto"],
        key["deployreferenceno"],
        key["repairdate"],
        key["repairby"],
        key["repairreferenceno"],
        key["returndate"],
        key["returnby"],
        key["returnfrom"],
        key["solddate"],
        key["soldby"],
        key["soldto"],
        key["soldreferenceno"]
      )
  );
};
//#endregion
