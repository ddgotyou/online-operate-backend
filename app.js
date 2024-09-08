var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var app = express();
//引入WebSocket模块
var expressWs = require("express-ws"); // 为app添加ws实例方法
expressWs(app);

//引入路由模块管理文件
var indexRouter = require("./routes/index");
var editRouter = require("./routes/edit");

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

//websocket server
app.ws("/ws", function (ws, req) {
  //监听打开
  ws.on("open", function () {
    console.log("连接已打开");
    ws.send("hello client");
  });
  //监听消息
  ws.on("message", function (msg) {
    console.log("来自客户端的消息", msg);
  });
  //监听问题
  ws.on("error", function (err) {
    console.log("发生错误", err);
  });
});

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
