// 云函数入口文件
const request = require('request')
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

const APPID = process.env.APPID

/** 消息模板-课程即将开始
 * 
 *     主题:      {{keyword1.DATA}}
 *     讲师:      {{keyword2.DATA}}
 *     时间:      {{keyword3.DATA}}
 *     教室:      {{keyword4.DATA}}
 *     温馨提示:  {{keyword5.DATA}}
 * 
 */
const TEMPLATEID = process.env.TEMPLATEID

const tknDoc = db.collection("admin_conf").doc("access_token")
const lecturesDb = db.collection("lectures")
const queueDb = db.collection("notifyQueue")

function lectTimeFmt(lectTime) {
  let options = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  };
  let dateTime = new Date(lectTime)
  // let dateTimeObj = {
  //   'YYYY': dateTime.getFullYear(),
  //   'M': dateTime.getMonth() + 1,
  //   'D': dateTime.getDate(),
  //   'H': dateTime.getHours(),
  //   'm': dateTime.getMinutes(),
  //   's': dateTime.getSeconds(),
  // }
  // let dateStr = `${dateTimeObj.YYYY}/${dateTimeObj.M}/${dateTimeObj.D}`
  // let timeStr = `${dateTimeObj.H}:${dateTimeObj.m}:${dateTimeObj.s}`
  // let dateTimeStr = `${dateStr} ${timeStr}`
  let dateTimeStr = new Intl.DateTimeFormat('zh-CN', options).format(dateTime)
  return dateTimeStr
}

function sendTemplateMessage(access_token, postData) {
  /**
   *  postData = {
   *    touser,
   *    template_id,
   *    form_id,
   *    *page,
   *    data,
   *  }
   */
  const postUrl = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send'

  var options = {
    method: 'POST',
    uri: postUrl,
    qs: {
      access_token
    },
    body: postData,
    header: {
      'content-type': 'application/json'
    },
    json: true, // Automatically stringifies the body to JSON
  };

  // console.log(options)

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error || body.errcode > 0) {
        reject({ res: body })
      } else {
        resolve({ res: body })
      }
    })
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  let now = new Date(), then = new Date()
  then.setMinutes(then.getMinutes() + 10)

  let ACC_TKN = await tknDoc.get().then((res) => {
    if (res.data.expires < now) {
      console.error("tkn expires!", { ACC_TKN, now })
    }
    return res.data
  }).catch(console.error)

  let queue = await queueDb.where({
    status: "pending",
    alarm_time: _.lte(then)
  }).get().then(res => { return res.data }).catch(console.error)

  let pushed = 0, failed = 0, returns = []

  for (let i = 0; i < queue.length; i++) {
    let { _id, _openid, alarm_time, form_id, lect_id, teacher } = queue[i]

    let form_data = await lecturesDb.doc(lect_id).get().then(res => {
      return {
        keyword1: { value: res.data.title },
        keyword2: { value: teacher },
        keyword3: { value: lectTimeFmt(res.data.time) },
        keyword4: { value: res.data.classroom },
        // keyword5: { value: "" },
      }
    }).catch(console.error)
    console.log({ form_data })

    let postData = {
      touser: _openid,
      template_id: TEMPLATEID,
      form_id,
      page: "pages/index/index",
      data: form_data,
    }

    let res = await sendTemplateMessage(ACC_TKN.tkn, postData)
      .then(async (res) => {
        await queueDb.doc(_id).update({
          data: {
            status: "pushed",
          }
        }).then(console.log)
        pushed++
        returns.push(res)
      })
      .catch(res => {
        console.error(res)
        failed++
        returns.push(res)
      })
  }

  return { pushed, failed, returns }
}