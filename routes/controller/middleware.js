var roleacess = [
  {
    role: "Administrator",
    routes: [
      {
        layout: "dashboard",
      },
    ],
  },
  {
    role: "User",
    routes: [
      {
        layout: "dashboard",
      },
    ],
  },
];

exports.Validator = function (req, res, layout) {
  console.log(layout);
  console.log(roleacess.length);

  if (req.session.accesstype == "User" && layout == "index") {
    return res.redirect("/dashboard");
  } else {
    roleacess.forEach((key, item) => {
      var routes = key.routes;

      routes.forEach((value, index) => {
        console.log(`${key.role} - ${value.layout}`);

        if (key.role == req.session.accesstype && value.layout == layout) {
          return res.render(`${layout}`, {
            employeeid: req.session.employeeid,
            fullname: req.session.fullname,
            department: req.session.department,
            position: req.session.position,
          });
        }
      });
    });

    res.redirect("/login");
  }
};
