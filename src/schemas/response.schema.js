const responseSuccess = (res, message, data) => {
  data.length > 1
    ? res.status(200).json({
        success: true,
        message: message,
        length: data.length,
        data: data,
      })
    : res.status(200).json({
        success: true,
        message: message,
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
