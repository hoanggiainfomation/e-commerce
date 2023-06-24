const router = require('express').Router();
const ctrl = require('../controllers/user');
const { verifyAccessToken, isAdmin } = require('../middlewares/veryfyToken');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/current', verifyAccessToken, ctrl.getCurrent);
router.post('/refreshtoken', ctrl.refreshAccessToken);
router.get('/logout', ctrl.logout);
router.get('/forgotpassword', ctrl.forgotPassword);
router.put('/resetpassword', ctrl.resetPassword);
// router.use(verifyAccessToken);
router.get('/', [verifyAccessToken, isAdmin], ctrl.getUsers);
router.delete('/', [verifyAccessToken, isAdmin], ctrl.deleteUser);
router.put('/current', [verifyAccessToken], ctrl.updateUser);
router.put('/:uid', [verifyAccessToken, isAdmin], ctrl.updateUserbyAdmin);

module.exports = router;
