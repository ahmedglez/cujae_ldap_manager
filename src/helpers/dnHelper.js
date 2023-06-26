const getFacultyFromDN = (dn) => {
  const branch = dn.toString().split(',')[2].replace('ou=', '')
  return branch
}

module.exports = { getFacultyFromDN }
