const express = require('express')
const router = express.Router()
const ProfileServices = require('../services/profile.services')
const { responseSuccess, responseError } = require('../schemas/response.schema')
const validateResponse = require('../middlewares/validateResponse')
const {
  checkAuth,
  checkRoles,
  checkBlacklist,
} = require('../middlewares/auth.handler')
const service = ProfileServices()

/**
 * @openapi
 * /api/v1/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get the user profile.
 *     description: Retrieve the user profile based on the UID (User ID) contained in the JSON Web Token (JWT) passed in the request headers. The endpoint requires authentication and user role permissions to access the profile information.
 *     operationId: getUserProfile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required permissions to access the profile.
 *       500:
 *         description: An error occurred while retrieving the user profile.
 */

router.get(
  '/',
  checkAuth,
/*   checkBlacklist, */
  checkRoles('user'),
  validateResponse,
  (req, res) => {
    service
      .getProfile(req)
      .then((data) => responseSuccess(res, 'data fetched succesfully', data))
      .catch((err) => responseError(res, err.message, err.errors))
  }
)

/**
 * @openapi
 * /api/v1/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update the user profile.
 *     description: Update the user profile based on the provided information in the request body. This endpoint requires authentication and user role permissions to access and modify the profile information.
 *     operationId: updateUserProfile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Profile update information.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: New email address for the user.
 *               password:
 *                 type: string
 *                 description: New password for the user.
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm the new password (required if password is provided).
 *             required:
 *               - email
 *           examples:
 *             UpdateProfileExample:
 *               value:
 *                 email: new.email@example.com
 *                 password: newPassword123
 *                 confirmPassword: newPassword123
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       400:
 *         description: Bad request. Invalid or missing parameters in the request body.
 *       401:
 *         description: Unauthorized. The user is not authenticated.
 *       403:
 *         description: Forbidden. The user does not have the required permissions to update the profile.
 *       500:
 *         description: An error occurred while updating the user profile.
 */

router.put(
  '/',
  checkAuth,
  checkBlacklist,
  checkRoles('user'),
  validateResponse,
  (req, res) => {
    const { email, password, confirmPassword } = req.body
    if (!email && !password) {
      responseError(res, 'fields cannot be empty', null)
    } else if (password) {
      if (password !== confirmPassword) {
        responseError(res, 'passwords must be the same')
      }
    } else {
      service
        .updateProfile(email, password, req)
        .then((data) => responseSuccess(res, 'data fetched succesfully', data))
        .catch((err) => responseError(res, err.message, err.errors))
    }
  }
)

module.exports = router
