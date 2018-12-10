//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    lectures: null
  },
  onLoad() {
    this.updateData()
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.updateData()
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },
  updateData() {
    let that = this;
    wx.request({
      url: 'https://lectures.yinr.cc/data/lectures.json',
      success(res) {
        that.setData({
          lectures: res.data.sort(
            (a, b) => (new Date(b.time)) - (new Date(a.time))
          )
        })
      },
    })
  }
})