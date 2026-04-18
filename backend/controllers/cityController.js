const City = require('../models/City');

// @desc    Get all saved cities
// @route   GET /api/cities
const getCities = async (req, res) => {
    try {
        const cities = await City.find();
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save a city
// @route   POST /api/cities
const saveCity = async (req, res) => {
    try {
        const { name, lat, lon } = req.body;
        
        // Ensure only max 12 cities are saved
        const count = await City.countDocuments();
        if (count >= 12) {
            return res.status(400).json({ message: 'Cannot save more than 12 cities' });
        }

        const cityExists = await City.findOne({ name });
        if (cityExists) {
            return res.status(400).json({ message: 'City already saved' });
        }

        const city = await City.create({ name, lat, lon });
        res.status(201).json(city);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a city
// @route   DELETE /api/cities/:id
const deleteCity = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }
        await city.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'City removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCities,
    saveCity,
    deleteCity
};
