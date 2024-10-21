const { docsCollection, logCollection } = require("../mongodb/open");
const { ObjectId } = require("mongodb");
var util=require("../utils/commonFunc")
class DocManager {
  constructor(docInfo) {
    this.docInfo = docInfo;
    this.content = this.docInfo.content ?? "";
    this.opStack = [];
    this.opUsers = [];
    this.focusStates=[]
  }
  getDocId() {
    return this.docInfo._id;
  }
  updateFocusUserArr(userState){
    if(userState.focus_user){
      const curState =  this.focusStates.findIndex((item) => item.focus_user._id === userState.focus_user._id)
      //已存在
      if(curState!==-1){
        //更新
        if(userState.focus_pos && userState.focus_pos.length>0){
          this.focusStates[curState].focus_pos = userState.focus_pos
        }
        else{
          //删除
          this.focusStates.splice(curState,1)
        }
      }
      else{
          if(userState.focus_pos && userState.focus_pos.length>0){
            //有效位置
            this.focusStates.push(userState)
          }
      }
      console.log('当前focusStates',this.focusStates)
    }
    return this.focusStates
  }
  applyOp(op) {
    this.opStack.push(op);
    //按照时间顺序，执行操作
    this.opStack.sort((a, b) => a.update_time - b.update_time);
    const new_op = this.opStack[this.opStack.length - 1];
    console.log("当前操作", new_op);
    //应用到新的内容中去
    if (new_op.type === "insert") {
      this.content =
        this.content.slice(0, new_op.position) +
        new_op.diff_content +
        this.content.slice(new_op.position+new_op.diff_length??0);
      console.log("插入后当前内容", this.content);
      this.saveContent();
      this.sendOpToOthers(new_op);
    } else if (new_op.type === "delete") {
      const len = new_op.diff_length?new_op.diff_length:1
      this.content =
        this.content.slice(0, new_op.position) +
        this.content.slice(new_op.position + len);
      console.log("删除后当前内容", this.content);
      this.saveContent();
      this.sendOpToOthers(new_op);
    }
  }
  addOnlineOpUser(ws,opUser) {
    if (this.opUsers.findIndex((item) => item._id === opUser._id) === -1) {
      const user={...opUser,ws}
      this.opUsers.push(user);
      console.log(`当前在线用户 doc:${this.docInfo}`, this.opUsers);
    }
  }
  removeOnlineOpUser(opUser) {
    const user_index = this.opUsers.findIndex(
      (item) => item._id === opUser._id
    );
    if (user_index !== -1) {
      this.opUsers.splice(user_index, 1);
      //同步删除聚焦状态
      const userState = this.focusStates.findIndex((item) => item.focus_user._id === opUser._id)
      if(userState!==-1){
        this.focusStates.splice(userState,1)
      }
    }
  }
  sendOpToOthers(op) {
    //发送给其他用户
    this.opUsers.forEach((user) => {
      if (op.op_user !== user._id) {
      console.log('发送给用户',op.op_user,user._id)
        //非本人用户
        user.ws.send(util.msgWrap("opAlert",op,"ok"));
      }
    });
  }
  saveContent() {
    if (this.content === this.docInfo.content) return;
    const { _id } = this.docInfo;
    const doc_objectid = new ObjectId(_id);
    //根据文档id 获取文档信息
    docsCollection
      .updateOne({ _id: doc_objectid }, { $set: { content: this.content } })
      .then((res) => {
        this.docInfo.content = this.content;
        console.log("更新成功", res);
      })
      .catch((err) => {
        console.log("更新失败", err);
      });
  }
}

module.exports = DocManager;
