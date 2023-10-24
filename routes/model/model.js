class MasterItemModel {
  constructor(id, name, category, status, createdby, createddate) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
  }
}

class MasterCategoryModel {
  constructor(id, name, status, createdby, createddate) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
  }
}

class EmployeeModel {
  constructor(
    id,
    fullname,
    position,
    department,
    username,
    password,
    access,
    status,
    createdby,
    createddate
  ) {
    this.id = id;
    this.fullname = fullname;
    this.position = position;
    this.department = department;
    this.username = username;
    this.password = password;
    this.access = access;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
  }
}

class ProductModel {
  constructor(
    assetcontrol,
    serial,
    category,
    podate,
    ponumber,
    warrantydate,
    status
  ) {
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.category = category;
    this.podate = podate;
    this.ponumber = ponumber;
    this.warrantydate = warrantydate;
    this.status = status;
  }
}

class DeployModel {
  constructor(id, assetcontrol, serial, date, deployby, deployto) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.deployby = deployby;
    this.deployto = deployto;
  }
}

class ReturnModel {
  constructor(id, assetcontrol, serial, date, returnby, returnfrom) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.returnby = returnby;
    this.returnfrom = returnfrom;
  }
}

class RepairModel {
  constructor(id, assetcontrol, serial, date, repairby) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.repairby = repairby;
  }
}

module.exports = {
  MasterItemModel,
  MasterCategoryModel,
  EmployeeModel,
  ProductModel,
  DeployModel,
  ReturnModel,
  RepairModel,
};
