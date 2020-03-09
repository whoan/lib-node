var Redis = require('ioredis')

class Subscriber {
  constructor (channelPrefix, msgHandler, host='redis') {
    if (!channelPrefix) {
      throw new Error('I need a channel to work')
    }
    if (!msgHandler) {
      throw new Error('I need a message handler')
    }

    const subscriber = new Redis({
      host: host,
      retryStrategy: function (times) {
        var delay = Math.min(times * 500, 2000)
        return delay
      }
    })

    subscriber.on('message', msgHandler)
    subscriber.on('pmessage', function (pattern, channel, info) {
      msgHandler(channel, info)
    })
    subscriber.psubscribe(channelPrefix + '*', function (error) {
      if (error) {
        throw new Error('Failed at psubscribing to channel: ' + channelPrefix + '*')
      }
    })
  }
}

module.exports = Subscriber
