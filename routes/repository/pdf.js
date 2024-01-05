const PdfMake = require("pdfmake");
const path = require("path");

const fontPath = path.join(
  __dirname,
  "/fonts/roboto-regular-webfont.ttf"
);

exports.GeneratePDF = () => {
  return new Promise((resolve, reject) => {
    var fonts = {
      Roboto: {
        normal: fontPath,
        bold: fontPath,
        italics: fontPath,
        bolditalics: fontPath,
      },
    };

    const printer = new PdfMake(fonts);

    //header
    let headers = {
      layout: "noBorders",
      fontSize: 8,
      alignment: "center",
      table: {
        widths: ["100%"],
        body: [
          [
            { text: "Logo", style: "header" },
            { text: "Company Name", style: "subheader" },
            { text: "Company Address", style: "subheader" },
            { text: "Tel No", style: "subheader" },
          ],
        ],
      },
    };

    let reportinfo = {
      layout: "noBorders",
      fontSize: 8,
      alignment: "left",
      table: {
        widths: ["75%", "25%"],
        body: [
          [
            {
              text: "Dated: 2024-01-04 to 2024-01-04",
              margin: [0, 20, 0, 0],
              style: "subheader",
            },
          ],
        ],
      },
    };

    var reportContent = {
      pageSize: "A4",
      pageOrientation: "portrait",
      content: [headers, reportinfo],
      styles: {
        header: {
          fontSize: 22,
        },
        anotherStyle: {
          alignment: "right",
        },
        subheader: {
          fontSize: 8,
        },
      },
    };

    console.log(reportContent);
    var pdfDoc = printer.createPdfKitDocument(reportContent);
    const chunks = [];

    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", (error) => reject(error));

    pdfDoc.end();
  });
};
