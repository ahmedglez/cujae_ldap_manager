function paginateResults(array, req) {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  console.log('page', page)
  console.log('limit', limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const results = {}

  results.results = array.slice(startIndex, endIndex)
  results.length = results.results.length

  if (endIndex < array.length) {
    results.next = {
      page: page + 1,
    }
  }
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
    }
  }
  return results
}

module.exports = paginateResults
