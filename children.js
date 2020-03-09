var childProcess = require('child_process')

function Children (errorHandler) {
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

    newChild.on('exit', handleDeleteChild.bind(null, id))

    newChild.on('close', function (code) {
      console.log('child process closed all stdio with code ' + code)
    })

    newChild.on('error', function (error) {
      console.error('process error ' + error)
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

  function forEach(handler) {
    Object.keys(children).forEach(handler)
  }

  function exist (id) {
    return !!children[id]
  }

  function handleDeleteChild (id, code, signal) {
    console.log(`child process exited with code ${code} and signal ${signal}`)
    if (code && errorHandler) {
      errorHandler(code)
    }
    delete children[id]
  }
}

module.exports = Children
