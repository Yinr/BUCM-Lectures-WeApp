// 云函数入口文件
const request = require('request')
const cloud = require('wx-server-sdk')
cloud.init()

const adminConf = cloud.database().collection("admin_conf")
const APPID = process.env.APPID
const SECRET = process.env.SECRET
const tknDoc = adminConf.doc("access_token")

// 云函数入口函数
exports.main = async (event, context) => {
  let options = {
    method: 'GET',
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    qs: {
      grant_type: 'client_credential',
      appid: APPID,
      secret: SECRET,
    },
    json: true, // Automatically stringifies the body to JSON
  };

  return await (new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject({ response, body })
      } else {
        res = body
        resolve(res)
      }
    })
  })).then(res => {
    let tkn = res.access_token

    let expires = new Date()
    expires.setSeconds(res.expires_in)

    return tknDoc.update({
      data: {
        tkn,
        expires,
      }
    })
  })
}