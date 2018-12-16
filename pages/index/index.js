//index.js
//获取应用实例
const app = getApp()
const QR = require("../../utils/qrcode.js")

Page({
  data: {
    lectures: {},
    showSignIn: false,
    tmpCanvasId: "tmp-canvas",
    cavDisplay: false,
    cavW: 200,
    cavH: 200,
  },
  onLoad() {
    wx.showLoading({
      title: '讲座数据加载中...',
    })
  },
  onReady() {
    this.updateData()
    wx.hideLoading()
    wx.showShareMenu({})
  },
  onPullDownRefresh() {
    this.updateData()
    wx.stopPullDownRefresh()
  },
  updateData() {
    let that = this;
    wx.request({
      url: 'https://lectures.yinr.cc/data/lectures.json',
      success(res) {
        let newLectures = res.data.sort(
          (a, b) => (new Date(b.time)) - (new Date(a.time))
        )
        if (that.data.lectures != newLectures) {
          that.setData({
            lectures: newLectures,
          })
        }
      },
    })
  },
  qrUrl(e) {
    var that = this;
    var qrUrl = e.detail.url,
      context = e.detail.that,
      canvasId = that.data.tmpCanvasId;

    that.setData({
      cavDisplay: true,
    });

    QR.qrApi.draw(
      qrUrl,
      canvasId,
      that,
      that.data.cavW,
      that.data.cavH,
      (url) => {
        context.setData({
          imagePath: url,
        });
        that.setData({
          cavDisplay: false,
        });
      }
    );
  }
})
