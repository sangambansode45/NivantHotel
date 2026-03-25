// const express = require('express');
// const router = express.Router();
// const itemController = require('../controllers/itemController');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');

// router.post('/', auth, upload, itemController.createItem);
// router.get('/', auth, itemController.getAllItems);
// router.get('/:id', auth, itemController.getItem);
// router.put('/:id', auth, upload, itemController.updateItem);
// router.delete('/:id', auth, itemController.deleteItem);

// module.exports = router;

const express = require('express');
const router = express.Router();

const itemController = require('../controllers/itemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// ✅ Create item (with image)
router.post('/', auth, upload.single("image"), itemController.createItem);

// ✅ Get all items
router.get('/', auth, itemController.getAllItems);

// ✅ Get single item
router.get('/:id', auth, itemController.getItem);

// ✅ Update item (with optional image)
router.put('/:id', auth, upload.single("image"), itemController.updateItem);

// ✅ Delete item
router.delete('/:id', auth, itemController.deleteItem);

module.exports = router;