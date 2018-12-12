//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    lectures: null
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
  }
})