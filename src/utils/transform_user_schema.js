const getObject = (arr) => {
  const newObj = {}
  arr.forEach((obj) => {
    newObj[obj.type] = obj.values.length === 1 ? obj.values[0] : obj.values
  })
  return newObj
}

const transform = (entry) => {
  const data = getObject(entry.pojo.attributes)

  return data
}

module.exports = transform
