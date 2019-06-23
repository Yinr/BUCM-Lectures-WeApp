//index.js
//获取应用实例
const app = getApp()
const QR = require("../../utils/qrcode.js")
const cloudUtils = require("../../utils/cloudUtils.js")

Page({
  data: {
    lectures: [],
    logined: false,
    admin: false,
    attended: 0,

    tmpCanvasId: "tmp-canvas",
    cavDisplay: false,
    cavW: 200,
    cavH: 200,
    windowHeight: 0,
    fullTipText: "",
  },
  onLoad() {
    var that = this
    wx.showLoading({
      title: '讲座数据加载中...',
    })
    wx.getSystemInfo({
      success(res) {
        var windowHeight = res.windowHeight
        that.setData({
          windowHeight: windowHeight,
        })
      },
    })

    // get login info
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              that.updateUserInfo(res.userInfo)
            }
          })
        }
      },
    })
  },
  onReady() {
    this.updateData()
    wx.hideLoading()
    wx.showShareMenu({})
  },
  onShow() {
    this.updateFullTipText()
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
        if (res.statusCode === 200) {
          let newLectures = res.data.sort(
            (a, b) => (new Date(b.time)) - (new Date(a.time))
          )
          if (that.data.lectures != newLectures) {
            that.setData({
              lectures: newLectures,
            })
            wx.setStorage({
              key: 'lectures',
              data: newLectures,
            })
          } else {
            console.warn({
              errMsg: 'fail to get lectures.json',
              res
            })
          }
        }
      },
      fail(res) {
        if (that.data.lectures.length == 0) {
          wx.showToast({
            //TODO: use top infomation bar to show infomation!
            // {background-color: red, position: fixed, top: 0, z-index: 500}
            // maybe using components?
            title: '网络错误，将加载缓存数据...',
            icon: 'none',
          })
          let storedLectures = wx.getStorageSync("lectures")
          if (storedLectures) {
            that.setData({
              lectures: storedLectures,
            })
          }
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
  },

  triggerLogin(e) {
    app.userInfo.userConfig.attended = 0
    this.updateUserInfo(e.detail.userInfo)
  },
  triggerUpdateUserInfo(e) {
    this.updateUserInfo({ nickName: app.userInfo.nickName })
  },
  updateUserInfo(userInfo) {
    let that = this

    // get cloud user config
    //TODO: add loading info
    cloudUtils.getUserConfig().then((res) => {
      let { admin, config, lectures } = res.data
      app.userInfo.nickName = userInfo.nickName
      app.userInfo.userConfig = {
        admin,
        config,
        lectures,
      }
      that.setData({
        "logined": true,
        admin,
        "attended": lectures.filter(lect => lect.attended).length,
      })
    }).catch(console.error)

    //TODO: add use of local storage
  },
  userConfig() {
    //TODO: config view
    return true
  },

  /**
   * Attended info
   */
  countAttend(newLectures = null) {
    let { lectures } = app.userInfo.userConfig
    let attended = this.data.attended
    if (newLectures) {
      lectures = newLectures
    }
    let count = lectures.filter(lect => lect.attended).length
    if (!(attended == count)) {
      this.setData({
        "attended": count
      })
    }
  },
  addAttend(e) {
    let id = e.detail.id,
      { config, lectures } = app.userInfo.userConfig
    if (!lectures.map(x => x.id).includes(id)) {
      let alarm_time = config.alarm ? config.alarm_time : -1
      let attended = true
      lectures.push({ id, alarm_time, attended })
      app.userInfo.userConfig.lectures = lectures
      cloudUtils.updateUserConfig({ config, lectures })
      this.countAttend(lectures)
    }
  },
  cleanAttended(e) {
    let that = this
    wx.showModal({
      title: '清空数据确认',
      content: '清空已参加讲座数据后将无法恢复，确认清空？',
      success(res) {
        if (res.confirm) {
          app.userInfo.userConfig.lectures = []
          that.setData({
            "attended": 0,
          })
          cloudUtils.updateUserConfig({ lectures: [] })
        }
      }
    })
  },

  updateFullTipText(text) {
    let textList = [
      "到底啦！到底啦！",
      "别拉了别拉了，已经都给你看光了嘛~",
      "人家是有底线的~",
      "上拉是没有刷新的啦~",
    ]
    let selectedText = textList[Math.floor(Math.random() * textList.length)]
    this.setData({
      fullTipText: selectedText,
    })
  },
})