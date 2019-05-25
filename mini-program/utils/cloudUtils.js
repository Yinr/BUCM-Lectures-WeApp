wx.cloud.init()

const db = wx.cloud.database();

/**
 * Config Utils
 */
const users = db.collection('users');
const getFields = {
  "admin": true,
  "config": true,
  "lectures": true,
}

let docId = ""

function getDefaultConfig() {
  return { "admin": false, "config": { "alarm": false, "alarm_time": 1 }, "lectures": [] }

  // let result = wx.cloud.callFunction({
  //   name: "getDefaultUserConfig",
  // }).then((res) => {
  //   console.log(res)
  //   return res.data
  // })

  // return result
}

function getUserConfig() {
  return new Promise((resolve, reject) => {
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
}

function updateUserConfig(userConfig) {
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

function addUserConfig(userConfig) {
  let { admin, config, lectures } = userConfig

  users.add({
    data: {
      admin,
      config,
      lectures,
    }
  })
}


/**
 * Queue Utils
 */
const queue = db.collection('notifyQueue')
function addQueue(data) {
  /**
   * data:
   *    form_id: String
   *    lect_id: number
   *    alarm_time: Date
   *    // status: String "pending"
   */
  if (data.form_id == 'the formId is a mock one') {
    return Promise.resolve('add queue while in devtool')
  } else {
    return queue.add({
      data: {
        'form_id': data.form_id,
        'lect_id': data.lect_id,
        'alarm_time': data.alarm_time,
        'status': 'pending',
        'add_time': Date.now(),
      }
    })
  }
}


module.exports = {
  getUserConfig,
  updateUserConfig,
  addQueue,
}