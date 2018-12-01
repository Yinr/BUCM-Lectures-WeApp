//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    lectures: null
  },
  onLoad() {
    var lects = require("../../datas/lectures.js")
    this.setData({
      lectures: lects.lectures.sort(
        (a, b) => (new Date(b.time)) - (new Date(a.time))
      )
    })
  }
})