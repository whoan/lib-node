class AsyncTask {
  constructor () {
    this.asyncTasks = {}
  }

  setTimeout (asyncTaskId, onComplete, onTimeout, timeout = 1500) {
    this.asyncTasks[asyncTaskId] = {
      onComplete,
      onTimeout
    }
    setTimeout(() => {
      const asyncTask = this.asyncTasks[asyncTaskId]
      if (asyncTask) {
        asyncTask.onTimeout()
        delete this.asyncTasks[asyncTaskId]
      }
    }, timeout)
  }

  complete (asyncTaskId) {
    const asyncTask = this.asyncTasks[asyncTaskId]
    if (asyncTask) {
      asyncTask.onComplete()
      delete this.asyncTasks[asyncTaskId]
    }
  }
}

module.exports = new AsyncTask()
