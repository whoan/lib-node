var Redis = require('ioredis')

function str (json) {
  return JSON.stringify(json)
}

class Db {
  constructor () {
    this.redis = new Redis({
      host: 'redis',
      retryStrategy: function (times) {
        var delay = Math.min(times * 500, 2000)
        return delay
      }
    })
  }

  save (key, value) {
    if (typeof value !== 'string' && !(value instanceof String)) {
      value = str(value)
    }
    return this.redis.set(key, value)
  }

  update (key, status) {
    return this.get(key).then(result => {
      if (!result) {
        throw new Error('Register not found or another error: ' + key)
      }
      return this.save(key, {
        ...JSON.parse(result),
        ...status
      })
    })
  }

  get (key) {
    return this.redis.get(key)
  }

  getAll (pattern) {
    // WARNING: this function currently assumes that the values are all json
    return this.redis.keys(pattern).then(result => {
      var pipeline = this.redis.pipeline()
      result.forEach(key => { pipeline.get(key) })
      return pipeline.exec().then(result => {
        return result.map(value => JSON.parse(value[1]))
      })
    })
  }

  delete (key) {
    return this.redis.del(key)
  }
}

module.exports = Db
