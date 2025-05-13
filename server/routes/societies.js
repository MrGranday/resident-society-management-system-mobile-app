const express = require('express');
const router = express.Router();
const Society = require('../models/Society');

router.get('/', async (req, res) => {
  try {
    const societies = await Society.find();
    res.json(societies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch societies', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const society = await Society.findById(req.params.id);
    if (!society) return res.status(404).json({ message: 'Society not found' });
    res.json(society);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch society', error });
  }
});

module.exports = router;