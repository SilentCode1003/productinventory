const PdfMake = require('pdfmake')
const fs = require('fs')
const { document } = require('./pdfcontent')
const path = require('path')
const { Template } = require('ejs')
require('dotenv').config()

const regularfont = path.join(__dirname, '/fonts/roboto-regular-webfont.ttf')
const boldfont = path.join(__dirname, '/fonts/roboto-bold-webfont.ttf')

exports.Generate = (data, template, employee, date) => {
  // console.log("Generating Phase: ", data);

  return new Promise((resolve, reject) => {
    const fonts = {
      Roboto: {
        normal: regularfont,
        bold: boldfont,
        italics: regularfont,
        bolditalics: regularfont,
      },
    }

    const printer = new PdfMake(fonts)

    const reportContent = document(data, template, employee, date)

    // console.log("Content: ", reportContent)
    // const pdfPath = path.join(
    //   __dirname,
    //   `/reports/Sales_Report_${GetCurrentDate()}.pdf`
    // );

    const pdfDoc = printer.createPdfKitDocument(reportContent)
    // pdfDoc.pipe(fs.createWriteStream(pdfPath));

    const chunks = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
    pdfDoc.on('error', (error) => reject(error))

    pdfDoc.end()
  })
}
