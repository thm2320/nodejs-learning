const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('password', 'Password has to be valid.')
      .isLength({ min: 4 })
      .isAlphanumeric()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter valid email')
      .custom((value, { req }) => {
        /* if (value === 'test@test.com') {
          //throw error to custom the error message
          throw new Error('This email address is forbidden.');
          //or return false to indicate invalid
        }
        return true; */
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('E-Mail already exists!');
            }
          });
      }),
    body('password', 'Please enter a password with only numbers and text and at least 4 characters.')
      .isLength({ min: 4 })
      .isAlphanumeric(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return false;
        }
        return true
      })
      .withMessage('Passwords have to match')
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;