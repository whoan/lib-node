var Redis = require('ioredis')

class Psubscriber {
  constructor (channelPattern, msgHandler, host = 'redis') {
    if (!channelPattern) {
      throw new Error('I need channel pattern to work')
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
    this.subscriber.psubscribe(channelPattern, function (error) {
      if (error) {
        throw new Error('Failed at psubscribing to pattern: ' + channelPattern)
      }
      console.log(`Subscribed to pattern: ${channelPattern}`)
    })
  }
}

module.exports = Psubscriber
