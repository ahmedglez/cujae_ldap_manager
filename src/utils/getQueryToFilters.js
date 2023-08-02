const getQueryToFilters = (req) => {
  let filters = []
  const { sex, condition, status, type, year, country, group, UJC, skinColor } =
    req.query
  if (sex !== undefined) filters.push(`sex=${sex.toString().toUpperCase()}`)
  else if (condition !== undefined)
    filters.push(`userCondition=${condition.toString().capitalize()}`)
  else if (status !== undefined)
    filters.push(`userStatus=${status.toString().capitalize()}`)
  else if (type !== undefined)
    filters.push(`userType=${type.toString().capitalize()}`)
  else if (year !== undefined) filters.push(`studentYear=${year.toString()}`)
  else if (country !== undefined)
    filters.push(`contry=${country.toString().capitalize()}`)
  else if (group !== undefined)
    filters.push(`studentClassGroup=${group.toString()}`)
  else if (UJC !== undefined) filters.push(`UJC=${UJC}`)
  else if (skinColor !== undefined)
    filters.push(`skinColor=${skinColor.toString().capitalize()}`)

  const filter = filters.join(',')
  return filter === '' || filter === undefined
    ? '(objectClass=person)'
    : `(${filter})`
}

module.exports = getQueryToFilters
