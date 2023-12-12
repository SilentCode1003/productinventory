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
    itemname,
    category,
    podate,
    ponumber,
    warrantydate,
    status
  ) {
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.itemname = itemname;
    this.category = category;
    this.podate = podate;
    this.ponumber = ponumber;
    this.warrantydate = warrantydate;
    this.status = status;
  }
}

class DeployModel {
  constructor(id, assetcontrol, serial, date, deployby, deployto, referenceno) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.deployby = deployby;
    this.deployto = deployto;
    this.referenceno = referenceno;
  }
}

class ReturnModel {
  constructor(
    id,
    assetcontrol,
    serial,
    date,
    returnby,
    returnfrom,
    referenceno
  ) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.returnby = returnby;
    this.returnfrom = returnfrom;
    this.referenceno = referenceno;
  }
}

class RepairModel {
  constructor(id, assetcontrol, serial, date, repairby, referenceno) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.repairby = repairby;
    this.referenceno = referenceno;
  }
}

class SoldModel {
  constructor(id, assetcontrol, serial, date, soldby, soldto, referenceno) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.soldby = soldby;
    this.soldto = soldto;
    this.referenceno = referenceno;
  }
}

class TransferModel {
  constructor(
    id,
    assetcontrol,
    serial,
    date,
    transferby,
    from,
    receivedby,
    to,
    referenceno
  ) {
    this.id = id;
    this.assetcontrol = assetcontrol;
    this.serial = serial;
    this.date = date;
    this.transferby = transferby;
    this.from = from;
    this.receivedby = receivedby;
    this.to = to;
    this.referenceno = referenceno;
  }
}

class MasterDepartmentModel {
  constructor(id, name, status, createdby, createddate) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
  }
}

class MasterAccessModel {
  constructor(id, name, status, createdby, createddate) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
  }
}

class MasterPositionModel {
  constructor(id, name, status, createdby, createddate) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
  }
}

class MasterClientModel {
  constructor(id, branch, company, status, createdby, createddate) {
    this.id = id;
    this.branch = branch;
    this.company = company;
    this.status = status;
    this.createdby = createdby;
    this.createddate = createddate;
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
  SoldModel,
  TransferModel,
  MasterDepartmentModel,
  MasterAccessModel,
  MasterPositionModel,
  MasterClientModel
};
