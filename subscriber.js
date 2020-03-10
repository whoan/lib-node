var Redis = require('ioredis')

class Subscriber {
  constructor (channels, msgHandler, host = 'redis') {
    if (!channels) {
      throw new Error('I need at least a channel to work')
    }
    if (!msgHandler) {
      throw new Error('I need a message handler')
    }

    this.subscriber = new Redis({
      host: host,
      retryStrategy: function (times) {
        var delay = Math.min(times * 500, 2000)
        return delay
      }
    })

    this.subscriber.on('message', function () {
      msgHandler(...arguments)
    })
    this.subscriber.subscribe(...channels, function (error, count) {
      if (error) {
        throw new Error(`Failed at subscribing to ${count} channels: ` + channels.join(' '))
      }
      console.log(`Subscribed to ${count} channels: ` + channels.join(' '))
    })
  }
}

module.exports = Subscriber
