var roleacess = [
  {
    role: "Admin",
    routes: [
      {
        layout: "index",
      },
      {
        layout: "access",
      },
      {
        layout: "category",
      },
      {
        layout: "client",
      },
      {
        layout: "department",
      },
      {
        layout: "deploy",
      },
      {
        layout: "employee",
      },
      {
        layout: "items",
      },
      {
        layout: "position",
      },
      {
        layout: "product",
      },
      {
        layout: "repair",
      },
      {
        layout: "return",
      },
      {
        layout: "sold",
      },
      {
        layout: "transfer",
      },
      {
        layout: "users",
      },
      {
        layout: "search",
      },
      {
        layout: "itemprice",
      },
      {
        layout: "replace",
      },
      {
        layout: "defective",
      },
      {
        layout: "report",
      },
    ],
  },
  {
    role: "User",
    routes: [
      {
        layout: "index",
      },
      {
        layout: "category",
      },
      {
        layout: "items",
      },
      {
        layout: "product",
      },
      {
        layout: "deploy",
      },
      {
        layout: "repair",
      },
      {
        layout: "return",
      },
      {
        layout: "sold",
      },
      {
        layout: "transfer",
      },
      {
        layout: "search",
      },
      {
        layout: "itemprice",
      },
      {
        layout: "employee",
      },
      {
        layout: "replace",
      },
      {
        layout: "defective",
      },
      {
        layout: "report",
      },
    ],
  },
];

exports.Validator = function (req, res, layout) {
  let ismatch = false;
  let counter = 0;
  roleacess.forEach((key, item) => {
    var routes = key.routes;
    counter += 1;
    routes.forEach((value, index) => {
      if (key.role == req.session.access && value.layout == layout) {
        console.log("Layout: ", layout, "Access: ", req.session.access);
        ismatch = true;
        return res.render(`${layout}`, {
          fullname: req.session.fullname,
          access: req.session.access,
          department: req.session.department,
          position: req.session.position,
        });
      }
    });
    if (counter == roleacess.length) {
      if (!ismatch) {
        res.redirect("/login");
      }
    }
  });
};
