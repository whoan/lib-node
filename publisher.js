var Redis = require('ioredis')

class Publisher {
  constructor (host='redis') {
    this.publisher = new Redis({
      host: host,
      retryStrategy: function (times) {
        var delay = Math.min(times * 500, 2000)
        return delay
      }
    })
  }

  publish(key, message) {
    return this.publisher.publish(key, message)
  }
}

module.exports = Publisher
