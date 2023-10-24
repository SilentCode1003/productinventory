const {
  MasterItemModel,
  MasterCategoryModel,
  EmployeeModel,
  ProductModel,
  DeployModel,
  ReturnModel,
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

exports.MasterItem = (data) => {
  let dataResult = [];

  data.forEach((key, item) => {
    dataResult.push({
      id: key.mc_id,
      inamed: key.mc_name,
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
        key["serial"],
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
    });
  });

  return dataResult.map(
    (key) =>
      new DeployModel(
        key["id"],
        key["serial"],
        key["date"],
        key["deployby"],
        key["deployto"]
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
    });
  });

  return dataResult.map(
    (key) =>
      new ReturnModel(
        key["id"],
        key["serial"],
        key["date"],
        key["returnby"],
        key["returnfrom"]
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
    });
  });

  return dataResult.map(
    (key) =>
      new ReturnModel(key["id"], key["serial"], key["date"], key["r_repairby"])
  );
};
