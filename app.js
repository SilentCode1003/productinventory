var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var morgan = require('morgan')
const { SetMongo } = require('./routes/controller/mogoose')
const { eventlogger, logger } = require('./middleware/logger')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var categoryRouter = require('./routes/category')
var deployRouter = require('./routes/deploy')
var employeeRouter = require('./routes/employee')
var itemsRouter = require('./routes/items')
var productRouter = require('./routes/product')
var repairRouter = require('./routes/repair')
var returnRouter = require('./routes/return')
var soldRouter = require('./routes/sold')
var transferRouter = require('./routes/transfer')
var accessRouter = require('./routes/access')
var departmentRouter = require('./routes/department')
var positionRouter = require('./routes/position')
var clientRouter = require('./routes/client')
var loginRouter = require('./routes/login')
var searchRouter = require('./routes/search')
var itempriceRouter = require('./routes/itemprice')
var replaceRouter = require('./routes/replace')
var defectiveRouter = require('./routes/defective')
var reportRouter = require('./routes/report')
const verifyJWT = require('./middleware/authenticator')

var app = express()

//Initialize Mongo DB and Sessions
SetMongo(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.json())
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  eventlogger(req, res, next)
})
app.use('/', loginRouter)
app.use(verifyJWT)
// app.use("/", indexRouter);
app.use('/index', indexRouter)
app.use('/users', usersRouter)
app.use('/category', categoryRouter)
app.use('/deploy', deployRouter)
app.use('/employee', employeeRouter)
app.use('/items', itemsRouter)
app.use('/product', productRouter)
app.use('/repair', repairRouter)
app.use('/return', returnRouter)
app.use('/sold', soldRouter)
app.use('/transfer', transferRouter)
app.use('/access', accessRouter)
app.use('/department', departmentRouter)
app.use('/position', positionRouter)
app.use('/client', clientRouter)

app.use('/search', searchRouter)
app.use('/itemprice', itempriceRouter)
app.use('/replace', replaceRouter)
app.use('/defective', defectiveRouter)
app.use('/report', reportRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  logger.error(err)

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
