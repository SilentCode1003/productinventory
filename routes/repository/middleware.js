var roleacess = [
  {
    role: "Admin",
    routes: [
      {
        layout: "index",
      },
      
    ],
  },
  {
    role: "User",
    routes: [
      {
        layout: "repeatrequest",
      },
    ],
  },
];

exports.Validator = function (req, res, layout) {
  console.log(layout);
  console.log(roleacess.length);

  if (req.session.roletype == "User" && layout == "index") {
    return res.redirect("/cablingdashboard");
  } else {
    roleacess.forEach((key, item) => {
      var routes = key.routes;

      routes.forEach((value, index) => {
        console.log(`${key.role} - ${value.layout}`);

        if (key.role == req.session.roletype && value.layout == layout) {
          return res.render(`${layout}`, {
            title: req.session.title,
            fullname: req.session.fullname,
            roletype: req.session.roletype,
            position: req.session.position,
            department: req.session.department,
          });
        }
      });
    });

    res.redirect("/login");
  }
};
