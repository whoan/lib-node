var Redis = require('ioredis')

class Psubscriber {
  constructor (channelPrefix, msgHandler, host = 'redis') {
    if (!channelPrefix) {
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

    this.subscriber.on('pmessage', function (pattern, channel, info) {
      msgHandler(channel, info)
    })
    this.subscriber.psubscribe(channelPrefix, function (error) {
      if (error) {
        throw new Error('Failed at psubscribing to channel: ' + channelPrefix)
      }
    })
  }
}

module.exports = Psubscriber
