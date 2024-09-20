var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var app = express();
var http = require("http");
// PS：端口冲突！！需要对http创建一个新端口的server
var server = http.createServer(app);
// 端口监听生效：1234
server.listen(1234);
var expressWs = require("express-ws");
// 指定websocket使用端口1234上的服务器
expressWs(app, server);

//引入路由模块管理文件
var indexRouter = require("./routes/index");
var editRouter = require("./routes/edit");
var wsRouter = require("./routes/wsService");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/editor", editRouter);
app.use("/ws", wsRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
