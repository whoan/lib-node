module.exports = {
  checkRequiredFields (fields, requiredFields) {
    return requiredFields.every(key => {
      const isPresent = (key in fields) && fields[key]
      if (!isPresent) {
        console.error(`Missing field: ${key}`)
      }
      return isPresent
    })
  }
}
