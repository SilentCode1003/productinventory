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
    ],
  },
];

exports.Validator = function (req, res, layout) {
  console.log("Layout: ", layout, "Access: ", req.session.access);

  roleacess.forEach((key, item) => {
    var routes = key.routes;

    routes.forEach((value, index) => {
      console.log(`${key.role} - ${value.layout}`);

      if (key.role == req.session.access && value.layout == layout) {
        return res.render(`${layout}`, {
          fullname: req.session.fullname,
          access: req.session.access,
          department: req.session.department,
          position: req.session.position,
        });
      }
    });
  });

  res.redirect("/login");
};
