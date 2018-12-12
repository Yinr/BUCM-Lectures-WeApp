// utils/components/lecture.js
var utils = require("../../utils/util.js")

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
    formatedTime: "",
    isDuring: false,
    isOut: false,
  },

  lifetimes: {
    attached() {
      this.setData({
        formatedTime: utils.formatTime(new Date(this.data.lectInfo.time)),
        isDuring: this.isDuringTime(this.data.lectInfo.time),
        isOut: this.isOutTime(this.data.lectInfo.time)
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
      wx.showToast({
        title: url,
        icon: 'none',
      });
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
      lectTime.setHours(0, -30);
      var now = new Date();
      return now >= lectTime && now <= lectEndTime;
    }
  }
})
