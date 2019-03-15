wx.cloud.init()

const db = wx.cloud.database();
const users = db.collection('users');
const getFields = {
  "admin": true,
  "config": true,
  "lectures": true,
}

let docId = ""

let getDefaultConfig = function () {
  return { "admin": false, "config": { "alarm": false, "alarm_time": 1 }, "lectures": [] }

  // let result = wx.cloud.callFunction({
  //   name: "getDefaultUserConfig",
  // }).then((res) => {
  //   console.log(res)
  //   return res.data
  // })

  // return result
}

let getUserConfig = () => new Promise((resolve, reject) => {
  users.count().then((res) => {
    if (res.total == 0) {
      let defaultConfig = getDefaultConfig()
      addUserConfig(defaultConfig)
      resolve({ result: { data: defaultConfig } })
    } else {
      return users.field(getFields).get()
        .then((res) => {
          let data = res.data[0], errMsg = res.errMsg
          docId = data._id
          resolve({ data, errMsg })
        })
        .catch(reject)
    }
  })
})

let updateUserConfig = function (userConfig) {
  if (docId) {
    let { config, lectures } = userConfig

    users.doc(docId).update({
      data: {
        config,
        lectures,
      }
    })
  }
}

let addUserConfig = function (userConfig) {
  let { admin, config, lectures } = userConfig

  users.add({
    data: {
      admin,
      config,
      lectures,
    }
  })
}

module.exports = {
  getUserConfig,
  updateUserConfig,
}