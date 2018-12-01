// utils/components/lecture.js
var utils = require("../../utils/util.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lectInfo: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    formatedTime: "",
    isDuring: false,
    isOut: false
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
      let url = 'https://bucmedu.wjx.cn/jq/' + this.data.lectInfo.id + '.aspx';
      console.log(url);
    },
    gotoSignInUrl() {
      let url = 'https://bucmedu.wjx.cn/app/checkin.aspx?activity=' + this.data.lectInfo.id;
      console.log(url);
    },
    gotoInfoUrl() {
      let url = this.data.lectInfo.url;
      console.log(url);
    },
    gotoClassroomUrl() {
      let url = 'https://class.yinr.cc/classroom/#' + this.data.lectInfo.classroom;
      if (this.data.lectInfo.classroom.length == 0) {
        url = "";
      }
      console(url);
    },
    isOutTime(strTime) {
      var lectEndTime = new Date(strTime);
      lectEndTime.setHours(lectEndTime.getHours() + 4);
      var now = new Date();
      return now > lectEndTime;
    },
    isDuringTime(strTime) {
      var lectTime = new Date(strTime);
      var lectEndTime = new Date(lectTime);
      lectEndTime.setHours(lectTime.getHours() + 4);
      lectTime.setHours(lectTime.getHours() - 1);
      var now = new Date();
      return now >= lectTime && now <= lectEndTime;
    }
  }
})
