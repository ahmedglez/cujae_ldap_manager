const responseSuccess = (res, message, data) => {
  const isPaginated = data.results !== undefined
  res.status(200).json({
    success: true,
    message: message,
    length: isPaginated ? data.results.length : data.length,
    data: data,
  })

  return res
}

const responseError = (res, message, errors) => {
  res.status(500).json({
    success: false,
    message: message,
    errors: errors,
  })

  return res
}

module.exports = {
  responseSuccess,
  responseError,
}
