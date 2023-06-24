const router = require('express').Router();
const ctrl = require('../controllers/product');
const { verifyAccessToken, isAdmin } = require('../middlewares/veryfyToken');

router.post('/', [verifyAccessToken, isAdmin], ctrl.createProduct);
router.get('/', ctrl.getProducts);
router.put('/:pid', [verifyAccessToken, isAdmin], ctrl.updateProduct);
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrl.deleteProduct);
router.get('/:pid', ctrl.getProduct);

module.exports = router;
