var childProcess = require('child_process')

class Children {
  constructor (userExitHandler) {
    this.children = {}
    this.userExitHandler = userExitHandler
  }

  create (id, command, params) {
    this.children[id] = childProcess.spawn(
      command,
      params,
      { detached: true }
    )
    var newChild = this.children[id]

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
      newChild.on('error', error => {
        console.error('error at creating process ' + error)
        delete this.children[id]
        if (reject) {
          reject(new Error('Something went wrong'))
        }
      })
      newChild.on('exit', this._handleExitChild.bind(this, id, reject))
      setTimeout(() => {
        if (this.children[id]) {
          resolve()
        }
      }, 300) // why 300 (seems reasonable)
    })
  }

  delete (id) {
    if (id in this.children) {
      this.children[id].pid && process.kill(-this.children[id].pid)
      delete this.children[id]
    } else {
      console.log('Unknown child')
    }
  }

  forEach (handler) {
    Object.keys(this.children).forEach(handler)
  }

  exist (id) {
    return !!this.children[id]
  }

  _handleExitChild (id, reject, code, signal) {
    if (reject) {
      reject('Something went wrong')
    }
    (code ? console.error : console.log)(`child process exited with code ${code} and signal ${signal}`)
    delete this.children[id]
    if (this.userExitHandler) {
      this.userExitHandler(id, code)
    }
  }
}

module.exports = Children
