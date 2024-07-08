const { image } = require('./base64')
const { GetCurrentDate, formatCurrency, Header, pdfTableContent } = require('./customhelper')

//#region @PDF Default Content
const pageOrientation = 'landscape'
const margin = [20, 110, 20, 20]

//@ use for header
const defaultHeader = {
  image: image,
  width: 800,
  height: 110,
  alignment: 'center',
  margin: [0, 0, 0, 0],
}

//@ use as divider
const divider = {
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 10,
      x2: 800,
      y2: 10,
      lineWidth: 1.3,
      //x2: 517 portrait
    },
  ],
}

//@ pdf styles
const styles = {
  header: { fontSize: 16, bold: true, alignment: 'center' },
  subheader: { fontSize: 11, alignment: 'center' },
  tableheader: { bold: true, margin: [0, 5, 0, 5], alignment: 'center', fontSize: 10 },
  tablecontent: { fontSize: 9, margin: [0, 5, 0, 5], alignment: 'center' },
  tableContentLeft: { fontSize: 9, margin: [0, 5, 0, 5], alignment: 'left' },
}

exports.document = (data, template, employee, date) => {
  let itemdetails = []
  let totalsales = 0

  //@ Title Page
  const titlePage = {
    layout: 'noBorders',
    text: template,
    style: 'header',
    margin: [0, 0, 0, 0],
  }

  //@ Sub Title Page
  let subTitlePage = {}
  if (employee !== '') {
    subTitlePage = {
      layout: 'noBorders',
      alignment: 'left',
      table: {
        body: [
          [
            {
              text: 'Employee: ' + employee,
              margin: [0, 20, 0, 0],
            },
          ],
          [
            {
              text: 'Date From: ' + date,
              margin: [0, 1, 0, 0],
            },
          ],
        ],
      },
    }
  } else {
    subTitlePage = {
      layout: 'noBorders',
      alignment: 'left',
      table: {
        body: [
          [
            {
              text: 'Date From: ' + date,
              margin: [0, 1, 0, 0],
            },
          ],
        ],
      },
    }
  }

  if (template == 'STOCKS REPORT') {
    itemdetails.push([
      {
        text: 'Item Name',
        style: 'tableheader',
        border: [false, true, false, true],
      },
      {
        text: 'Category',
        style: 'tableheader',
        border: [false, true, false, true],
      },
      {
        text: 'Stocks',
        style: 'tableheader',
        border: [false, true, false, true],
      },
      {
        text: 'Total Price',
        style: 'tableheader',
        border: [false, true, false, true],
      },
    ])
    let countertester = 0

    Object.keys(data).forEach((key, index) => {
      const item = data[key]
      totalsales += parseInt(item.totalPrice)
      countertester += 1
      console.log(
        'No.: ',
        countertester,
        `"item Name:" ${key}, Category: ${item.category}, stock: ${item.stocks}`
      )

      itemdetails.push([
        {
          text: key,
          border: [false, false, false, false],
          style: 'tablecontent',
        },
        {
          text: item.category,
          border: [false, false, false, false],
          style: 'tablecontent',
        },
        {
          text: item.stocks.toString(),
          border: [false, false, false, false],
          style: 'tablecontent',
        },
        {
          text: `Php ${formatCurrency(item.totalPrice)}`,
          border: [false, false, false, false],
          style: 'tablecontent',
        },
      ])
    })

    let content = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      margin: 10,
      pageMargins: [35, 85, 35, 35],
      header: defaultHeader,
      content: [
        {
          layout: 'noBorders',
          text: template,
          style: 'header',
          margin: [0, 20, 0, 0],
        },
        {
          layout: 'noBorders',
          alignment: 'left',
          table: {
            body: [
              [
                {
                  text: 'Date: ' + GetCurrentDate(),
                  margin: [0, 20, 0, 0],
                },
              ],
            ],
          },
        }, //Sub Header Details
        {
          margin: [0, 15, 0, 0],
          table: {
            widths: ['20%', '30%', '20%', '30%'],
            body: itemdetails,
          },
        },

        //divider
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 762,
              y2: 10,
              lineWidth: 1.3,
              //x2: 517 portrait
            },
          ],
        },
        //divider

        {
          layout: 'noBorders',
          fontSize: 9,
          table: {
            widths: ['70.5%', '29.5%'],
            body: [
              [
                {
                  text: 'Subtotal: ',
                  margin: [0, 2.5, 0, 0],
                  bold: true,
                  alignment: 'right',
                },
                {
                  text: `Php ${formatCurrency(totalsales)}`,
                  margin: [0, 2.5, 0, 0],
                },
              ],
            ],
          },
        },

        {
          layout: 'noBorders',
          fontSize: 9,
          table: {
            widths: ['70.5%', '29.5%'],
            body: [
              [
                {
                  text: 'Total: ',
                  margin: [0, 2.5, 0, 0],
                  bold: true,
                  alignment: 'right',
                },
                {
                  text: `Php ${formatCurrency(totalsales)}`,
                  margin: [0, 2.5, 0, 0],
                },
              ],
            ],
          },
        },
        {
          canvas: [
            {
              //517 portrait
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 762,
              y2: 10,
              lineWidth: 1.3,
            },
          ],
        },
      ],

      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
        },
        subheader: {
          fontSize: 11,
          alignment: 'center',
        },
        tableheader: {
          bold: true,
          margin: [0, 5, 0, 5],
        },
        tablecontent: {
          fontSize: 9,
          margin: [0, 2.5, 0, 2.5],
        },
      },
    }

    return content
  }

  if (template == 'SALES REPORT') {
    let paid = 0
    let notpaid = 0

    let headers = [
      { text: 'Date', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Reference No.', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Category', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Item Name', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Price', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Delivery Fee', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Quantity', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Payment Type', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Trx Ref. No. Type', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Status', style: 'tableheader', border: [false, true, false, true] },
      { text: 'Total', style: 'tableheader', border: [false, true, false, true] },
    ]

    if (employee == '') {
      headers.splice(10, 0, {
        text: 'Sold By',
        style: 'tableheader',
        border: [false, true, false, true],
      })
    }

    const widths = [
      '7%', //date
      '*', //refNo
      '7.5%', //category
      '6.5%', //itemName
      '6.5%', //price
      '5.5%', //deliveryFee
      '6%', //quantity
      '7%', //paymentType
      '*', //transacRefNo
      '5%', //status
      '11%', //total
    ]

    if (employee == '') {
      widths.splice(10, 0, '*') // Add the width for the "Sold By" column
    }

    let itemdetails = [headers]
    let globalIndex = 0

    Object.keys(data).forEach((key, index) => {
      const itemsForDate = data[key]
      itemsForDate.forEach((item) => {
        let totalcost = parseFloat(item.price) * parseInt(item.quantity)
        totalsales += totalcost
        if (item.status === 'PAID') {
          paid += parseFloat(item.price) * parseInt(item.quantity)
        } else {
          notpaid += parseFloat(item.price) * parseInt(item.quantity)
        }

        const fillColor = globalIndex % 2 === 0 ? '#f5f5f5' : null
        globalIndex++

        let row = [
          {
            text: key,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: item.soldRefNo,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: item.category,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: item.productName,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: formatCurrency(item.price),
            border: [false, false, false, false],
            style: 'tableContentLeft',
            fillColor: fillColor,
          },
          {
            text: formatCurrency(item.deliveryFee),
            border: [false, false, false, false],
            style: 'tableContentLeft',
            fillColor: fillColor,
          },
          {
            text: item.quantity,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: item.paymentType.toUpperCase(),
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: item.transacRefNo,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: item.status,
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          },
          {
            text: `Php ${formatCurrency(totalcost)}`,
            border: [false, false, false, false],
            style: 'tableContentLeft',
            fillColor: fillColor,
          },
        ]

        if (employee == '') {
          row.splice(10, 0, {
            text: item.fullName.toUpperCase(),
            border: [false, false, false, false],
            style: 'tablecontent',
            fillColor: fillColor,
          })
        }

        itemdetails.push(row)
      })
    })

    console.log(itemdetails)

    let content = {
      pageSize: 'A4',
      pageOrientation: pageOrientation,
      pageMargins: margin,
      header: defaultHeader,
      content: [
        titlePage,
        subTitlePage,
        {
          margin: [0, 15, 0, 0],
          table: {
            widths: widths,
            body: itemdetails,
          },
        },
        {
          layout: 'noBorders',
          fontSize: 9,
          table: {
            widths: ['88%', '12%'],
            body: [
              [
                {
                  text: 'Total Unpaid: ',
                  margin: [0, 2.5, 0, 0],
                  bold: true,
                  alignment: 'right',
                },
                {
                  text: `Php ${formatCurrency(notpaid)}`,
                  margin: [0, 2.5, 0, 0],
                },
              ],
            ],
          },
        },
        {
          layout: 'noBorders',
          fontSize: 9,
          table: {
            widths: ['88%', '12%'],
            body: [
              [
                {
                  text: 'Total Paid: ',
                  margin: [0, 2.5, 0, 0],
                  bold: true,
                  alignment: 'right',
                },
                {
                  text: `Php ${formatCurrency(paid)}`,
                  margin: [0, 2.5, 0, 0],
                },
              ],
            ],
          },
        },
        {
          layout: 'noBorders',
          fontSize: 9,
          table: {
            widths: ['88%', '12%'],
            body: [
              [
                {
                  text: 'Total: ',
                  margin: [0, 2.5, 0, 0],
                  bold: true,
                  alignment: 'right',
                },
                {
                  text: `Php ${formatCurrency(totalsales)}`,
                  margin: [0, 2.5, 0, 0],
                },
              ],
            ],
          },
        },
      ],

      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
        },
        subheader: {
          fontSize: 11,
          alignment: 'center',
        },
        tableheader: {
          bold: true,
          margin: [0, 5, 0, 5],
          alignment: 'center',
          fontSize: 10,
        },
        tablecontent: {
          fontSize: 9,
          margin: [0, 5, 0, 5],
          alignment: 'center',
        },
        tableContentLeft: {
          fontSize: 9,
          margin: [0, 5, 0, 5],
          alignment: 'left',
        },
      },
    }

    return content
  }

  if (template == 'SOLD PRODUCTS REPORT') {
    const header = Header(
      ['Date', 'Reference No.', 'Category', 'Product Name', 'Serial', 'Sold To'],
      'tableheader'
    )
    const widths = ['10%', '*', '*', '*', '*', '*']
    const tableContent = pdfTableContent(data, 'tablecontent')

    let itemdetails = [header, ...tableContent]

    let content = {
      pageSize: 'A4',
      pageOrientation: pageOrientation,
      pageMargins: margin,
      header: defaultHeader,
      content: [
        titlePage,
        subTitlePage,
        {
          margin: [0, 15, 0, 0],
          table: { widths: widths, body: itemdetails },
        },
      ],
      styles: styles,
    }

    return content
  }
}
