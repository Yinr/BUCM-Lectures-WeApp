// utils/components/lecture.js
var utils = require("../../utils/util.js")
var QR = require("../../utils/qrcode.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lectInfo: {
      type: Object,
    },
    showSignIn: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showQr: false,
    qrId: "",
    qrHeight: "220px",
    formatedTime: "",
    isDuring: false,
    isOut: false,
    imagePath: "",
  },

  lifetimes: {
    attached() {
      this.setData({
        qrId: "qr-" + this.data.lectInfo.id,
        formatedTime: utils.formatTime(new Date(this.data.lectInfo.time)),
        isDuring: this.isDuringTime(this.data.lectInfo.time),
        isOut: this.isOutTime(this.data.lectInfo.time),
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoSignUpUrl() {
      wx.navigateToMiniProgram({
        appId: 'wxd947200f82267e58',
        path: 'pages/wjxqList/wjxqList?activityId=' + this.data.lectInfo.id,
      })
    },
    gotoSignInUrl() {
      let url = 'https://bucmedu.wjx.cn/app/checkin.aspx?activity=' + this.data.lectInfo.id;
      this.setData({
        showQr: !this.data.showQr,
      })
      if (this.data.showQr) {
        if (this.data.imagePath == "") {
          this.createQrCode(url, this.data.qrId, 200, 200)
        } else {
          const ctx = wx.createCanvasContext(this.data.qrId, this)
          ctx.drawImage(this.data.imagePath, 0, 0, 200, 200)
          ctx.draw()
        }
      }
    },
    gotoInfoUrl() {
      let url = this.data.lectInfo.url;
      wx.showToast({
        title: url,
        icon: 'none',
      });
    },
    gotoClassroomUrl() {
      let url = 'https://class.yinr.cc/classroom/#' + this.data.lectInfo.classroom;
      if (this.data.lectInfo.classroom.length == 0) {
        url = "";
      } else {
        wx.showToast({
          title: url,
          icon: 'none',
        });
      }
    },
    isOutTime(strTime) {
      var lectEndTime = new Date(strTime);
      lectEndTime.setHours(22);
      var now = new Date();
      return now > lectEndTime;
    },
    isDuringTime(strTime) {
      var lectTime = new Date(strTime);
      var lectEndTime = new Date(lectTime);
      lectEndTime.setHours(22);
      lectTime.setHours(lectTime.getHours(), lectTime.getMinutes() - 30);
      var now = new Date();
      return now >= lectTime && now <= lectEndTime;
    },

    createQrCode: function (url, canvasId, cavW, cavH) {
      //调用插件中的draw方法，绘制二维码图片
      var that = this;
      QR.qrApi.draw(url, canvasId, this, cavW, cavH, (url) => {
        this.setData({
          imagePath: url,
        })
      });
    },
    //点击图片进行预览，长按保存分享图片
    previewImg: function (e) {
      var img = this.data.imagePath
      wx.previewImage({
        current: img, // 当前显示图片的http链接
        urls: [img], // 需要预览的图片http链接列表
      })
    },
  }
})
