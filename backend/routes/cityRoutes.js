const express = require('express');
const router = express.Router();
const { getCities, saveCity, deleteCity } = require('../controllers/cityController');

router.route('/').get(getCities).post(saveCity);
router.route('/:id').delete(deleteCity);

module.exports = router;
