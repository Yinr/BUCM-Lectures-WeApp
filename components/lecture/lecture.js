// utils/components/lecture.js
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoSignUpUrl(id) {
      var url = 'https://bucmedu.wjx.cn/jq/' + id + '.aspx';
      return url;
    },
    gotoSignInUrl(id) {
      var url = 'https://bucmedu.wjx.cn/app/checkin.aspx?activity=' + id;
      return url;
    },
    gotoInfoUrl(url) {
      console.log(url)
    },
    gotoClassroomUrl(classroom) {
      var url = 'https://class.yinr.cc/classroom/#' + classroom;
      if (classroom.length == 0) {
        url = "";
      }
      return url;
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
