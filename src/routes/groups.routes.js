const express = require('express')
const router = express.Router()

const GroupServices = require('../services/group.services')
const service = GroupServices()

router.get('/:group', (req, res) => {
  service.getUserByGroup(req.params.group).then((data) =>
    res
      .status(200)
      .json({
        success: 'true',
        message: 'data fetched succesfully',
        data: data,
      })
      .catch((err) =>
        res.status(400).send({
          success: 'false',
          message: err.message,
        })
      )
  )
})

module.exports = router
