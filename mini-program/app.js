//app.js
App({
  onLaunch() {
    const updateManager = wx.getUpdateManager()

    updateManager.onUpdateReady((res) => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },
  onPageNotFound(res) {
    wx.redirectTo({
      url: './pages/index/index.js'
    })
  },
  userInfo: {
    "nickName": "",
    userConfig: {
      "admin": false,
      "config": {
        "alarm": false,
        "alarm_time": 1,
      },
      "lectures": [],
    },
  },
})