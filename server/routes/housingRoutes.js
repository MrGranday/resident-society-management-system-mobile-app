// housingRoutes.js
const express = require('express');
const Housing = require('../models/housingModel');


const router = express.Router({ mergeParams: true });

// Create a new housing entry
router.post('/', async (req, res) => {
  try {
    const { address, houseNumber } = req.body;
    const societyId = req.params.societyId;

    const housingEntry = new Housing({
      society: societyId,
      address,
      houseNumber
    });

    const savedEntry = await housingEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all housing entries for a society
router.get('/', async (req, res) => {
  try {
    const housingEntries = await Housing.find({ society: req.params.societyId });
    res.json(housingEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
