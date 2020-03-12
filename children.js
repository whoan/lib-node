var childProcess = require('child_process')

function Children () {
  this.create = createChild
  this.delete = deleteChild
  this.exist = exist
  this.forEach = forEach

  const children = {}

  function createChild (id, command, params) {
    children[id] = childProcess.spawn(
      command,
      params,
      { detached: true }
    )
    var newChild = children[id]

    // noinspection JSUnresolvedFunction
    newChild.stdout.setEncoding('utf8')
    newChild.stdout.on('data', function (data) {
      var str = data.toString()
      var lines = str.split(/(\r?\n)/g)
      console.log(lines.join(''))
    })

    newChild.stderr.setEncoding('utf8')
    newChild.stderr.on('data', function (data) {
      var str = data.toString()
      var lines = str.split(/(\r?\n)/g)
      console.error(lines.join(''))
    })

    newChild.on('close', function (code) {
      console.log('child process closed all stdio with code ' + code)
    })

    return new Promise((resolve, reject) => {
      newChild.on('error', function (error) {
        if (reject) {
          reject('Something went wrong')
        }
        console.error('error at creating process ' + error)
        delete children[id]
      })
      newChild.on('exit', handleDeleteChild.bind(null, id, reject))
      setTimeout(() => {
        if (children[id]) {
          resolve()
        }
      }, 300) // why 300 (seems reasonable)
    })
  }

  function deleteChild (id) {
    if (id in children) {
      process.kill(-children[id].pid)
      delete children[id]
    } else {
      console.log('Unknown child')
    }
  }

  function forEach (handler) {
    Object.keys(children).forEach(handler)
  }

  function exist (id) {
    return !!children[id]
  }

  function handleDeleteChild (id, reject, code, signal) {
    if (reject) {
      reject('Something went wrong')
    }
    (code ? console.error : console.log)(`child process exited with code ${code} and signal ${signal}`)
    delete children[id]
  }
}

module.exports = Children
