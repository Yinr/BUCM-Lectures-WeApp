'use strict';
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();
const getFields = {
  "admin": true,
  "config": true,
  "lectures": true,
}

exports.main = (event, context, callback) => {
  const {
    OPENID,
    APPID,
    UNIONID
  } = cloud.getWXContext()

  console.log({ OPENID, APPID, UNIONID })

  return db.collection('admin_conf').doc("user-config").field(getFields).get()
};