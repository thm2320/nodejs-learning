const express = require('express');
const { check } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post(
  '/signup',
  check('email')
    .isEmail()
    .withMessage('Please enter valid email')
    .custom((value , {req}) => {
      if (value === 'test@test.com'){
        //throw error to custom the error message
        throw new Error('This email address is forbidden.');  
        //or return false to indicate invalid
      }
      return true;
    }),
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;