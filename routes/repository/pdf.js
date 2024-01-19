const PdfMake = require("pdfmake");
const fs = require("fs");
const { document } = require("./pdfcontent")
const path = require("path");
const { Template } = require("ejs");
require("dotenv").config();

const regularfont = path.join(
  __dirname,
  "/fonts/roboto-regular-webfont.ttf"
);
const boldfont = path.join(
  __dirname,
  "/fonts/roboto-bold-webfont.ttf"
);

exports.Generate = (data, template) => {
  console.log("Generating Phase: ", data);
  
  return new Promise((resolve, reject) => {
    var fonts = {
      Roboto: {
        normal: regularfont,
        bold: boldfont,
        italics: regularfont,
        bolditalics: regularfont,
      },
    };

    const printer = new PdfMake(fonts);

    var reportContent = document(data, template)

    console.log("Content: ", reportContent)
    // const pdfPath = path.join(
    //   __dirname,
    //   `/reports/Sales_Report_${GetCurrentDate()}.pdf`
    // );

    var pdfDoc = printer.createPdfKitDocument(reportContent);
    // pdfDoc.pipe(fs.createWriteStream(pdfPath));

    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", (error) => reject(error));

    pdfDoc.end();
  });
};