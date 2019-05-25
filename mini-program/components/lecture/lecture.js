// utils/components/lecture.js
let utils = require("../../utils/util.js")
let cloudUtils = require('../../utils/cloudUtils.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lectInfo: {
      type: Object,
      /**
       * id: 讲座问卷星ID
       * title: 讲座标题
       * time: 讲座时间
       * classroom: 讲座地点
       * infoId: 讲座信息ID（秀米）
       */
    },
    admin: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showQr: false,
    imagePath: "",
    formatedTime: "",
    isDuring: false,
    isOut: false,
  },

  lifetimes: {
    attached() {
      this.setData({
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
    gotoSignInUrl(event) {
      if (event.type == "longpress") {
        this.setData({
          imagePath: "",
        })
      }
      let url = 'https://bucmedu.wjx.cn/app/checkin.aspx?activity=' + this.data.lectInfo.id + '#';
      if (!this.data.showQr) {
        if (this.data.imagePath == "") {
          var that = this
          this.triggerEvent('getQrUrl', { url, that })
        }
      }
      this.setData({
        showQr: !this.data.showQr,
      })
    },
    gotoInfoUrl() {
      let url = "https://r.xiumi.us/stage/v5/37Dxv/" + this.data.lectInfo.infoId;

      wx.request({
        url: url,
        method: 'GET',
        dataType: 'html',
        responseType: 'text',
        success(res) {
          if (res.statusCode == 200) {
            const info = /injectedData.showInfo *= *JSON.parse\(decodeURIComponent\("([^"]*)"\)\);/
            var infoRes = info.exec(res.data)
            infoRes = JSON.parse(decodeURIComponent(infoRes[1]))
            console.log(infoRes)
            var infoDesc = infoRes.desc

            wx.showToast({
              title: infoDesc,
              icon: 'none',
            });
          } else {
            console.log({
              info: "lecture info request " + res.statusCode,
              err: res
            })
          }
        },
      })
    },
    gotoClassroomUrl() {
      let url = 'https://class.yinr.cc/classroom/#' + this.data.lectInfo.classroom;
      if (this.data.lectInfo.classroom.length === 0) {
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
    isInAlarmTime(strTime) {
      var lectTime = new Date(strTime);
      var lectStartAlarmTime = new Date(lectTime);
      lectStartAlarmTime.setDate(lectStartAlarmTime.getDate() - 7);
      var now = new Date();
      return now <= lectTime && now >= lectStartAlarmTime;
    },

    longTapTime(e) {
      let id = this.data.lectInfo.id
      let eventDetail = { id }
      let eventOption = {}
      this.triggerEvent('addAttend', eventDetail, eventOption)
    },

    //点击图片进行预览，长按保存分享图片
    previewImg: function (e) {
      var img = this.data.imagePath
      wx.previewImage({
        current: img, // 当前显示图片的http链接
        urls: [img], // 需要预览的图片http链接列表
      })
    },

    setAlarm(e) {
      let that = this
      if (!that.isInAlarmTime(that.data.lectInfo.time)) {
        let startAlarmTime = new Date(that.data.lectInfo.time)
        startAlarmTime.setDate(startAlarmTime.getDate() - 7)
        wx.showToast({
          title: '由于微信限制，请于 ' + utils.formatTime(startAlarmTime) + '后再次尝试设置提醒',
          icon: 'none',
          image: '',
          duration: 2000,
          mask: true,
        })
        return false
      }
      console.log(e.detail.formId)
      let alarm_time = new Date(that.data.lectInfo.time)
      alarm_time.setHours(alarm_time.getHours() - 1)
      cloudUtils.addQueue({
        form_id: e.detail.formId,
        lect_id: that.data.lectInfo.id,
        alarm_time,
      }).then(res => {
        console.log(res)
        wx.showToast({
          title: '已成功设置提醒',
          icon: 'success',
          duration: 1500,
          mask: false,
        })
      }).catch(res => {
        console.log({ errCode: res.errCode, errMsg: res.errMsg })
        if (res.errCode === -502001) {
          wx.showToast({
            title: '该项提醒已设置',
            icon: 'none',
            duration: 1500,
            mask: false,
          })
        }
      })
    }
  }
})
