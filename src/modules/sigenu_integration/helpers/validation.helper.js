const validateAttributes = (attributes, requiredAttributes) => {
  const missingAttributes = requiredAttributes.filter(
    (attr) => !attributes.hasOwnProperty(attr)
  )

  if (missingAttributes.length > 0) {
    const errorMessage = `Missing required attribute(s): ${missingAttributes.join(
      ', '
    )}`
    throw new Error(errorMessage)
  }
}

module.exports = { validateAttributes }
