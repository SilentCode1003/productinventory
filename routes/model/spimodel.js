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

exports.Return = (data) => {
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
      new ReturnModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["r_repairby"],
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
      id: key.r_id,
      assetcontrol: key.r_assetcontrol,
      serial: key.r_serial,
      date: key.r_date,
      repairby: key.r_repairby,
      referenceno: key.referenceno,
    });
  });

  return dataResult.map(
    (key) =>
      new TransferModel(
        key["id"],
        key["assetcontrol"],
        key["serial"],
        key["date"],
        key["r_repairby"],
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
