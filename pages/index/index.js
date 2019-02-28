//index.js
//获取应用实例
const app = getApp()
const QR = require("../../utils/qrcode.js")

Page({
  data: {
    lectures: [],
    showSignIn: false,
    user: {
      nickName: "",
      attended: []
    },
    tmpCanvasId: "tmp-canvas",
    cavDisplay: false,
    cavW: 200,
    cavH: 200,
    logined: false,
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
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              that.updateUserInfo(res.userInfo.nickName)
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

  login(e) {
    let that = this
    let userInfo = e.detail.userInfo,
      nickName = userInfo.nickName
    that.updateUserInfo(nickName)
  },
  updateUserInfo(nickName) {
    let that = this
    let authUser = that.isAuthUser(nickName)
    wx.getStorage({
      key: nickName,
      success: function (res) {
        that.setData({
          'user': res.data,
        })
      },
      complete(res) {
        that.setData({
          logined: true,
          showSignIn: authUser,
          'user.nickName': nickName,
        })
      }
    })
  },
  isAuthUser(nickName) {
    let allowedUser = ['Yinr', '梳子agnes', '张']
    return allowedUser.includes(nickName)
  },
  userConfig() {
    return true
  },

  /**
   * Attended info
   */
  addAttend(e) {
    let that = this
    let id = e.detail.id,
      user = this.data.user
    if (!user.attended.includes(id)) {
      user.attended.push(id)
      this.setData({
        'user.attended': user.attended,
      })
      wx.setStorage({
        key: user.nickName,
        data: user,
      })
    }
  },
  cleanAttended(e) {
    let that = this
    let user = that.data.user
    wx.showModal({
      title: '清空数据确认',
      content: '清空已参加讲座数据后将无法恢复，确认清空？',
      success(res) {
        if (res.confirm) {
          that.setData({
            'user.attended': []
          })
          user.attended = []
          wx.setStorage({
            key: that.data.user.nickName,
            data: user,
          })
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
  }
})