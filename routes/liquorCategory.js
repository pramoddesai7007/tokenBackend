const express = require("express");
const mongoose = require("mongoose");
const LiquorCategory = require("../models/LiquorCategory");


const router = express();


// POST API to create a new BarMenu
router.post("/", async (req, res) => {
  try {
    const newBarMenu = await LiquorCategory.create(req.body);
    res.status(201).json(newBarMenu);
    console.log(newBarMenu.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET API to get all BarMenus
router.get("/barMenus", async (req, res) => {
  try {
    const allBarMenus = await LiquorCategory.find();
    res.status(200).json(allBarMenus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET API to get a specific BarMenu by ID
router.get("/barMenus/:id", async (req, res) => {
  try {
    const barMenu = await LiquorCategory.findById(req.params.id);
    if (!barMenu) {
      return res.status(404).json({ message: "BarMenu not found" });
    }
    res.status(200).json(barMenu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT API to update a specific BarMenu by ID
router.put("/barMenus/:id", async (req, res) => {
  try {
    const updatedBarMenu = await LiquorCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBarMenu) {
      return res.status(404).json({ message: "BarMenu not found" });
    }
    res.status(200).json(updatedBarMenu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE API to delete a specific BarMenu by ID
router.delete("/barMenus/:id", async (req, res) => {
  try {
    const deletedBarMenu = await LiquorCategory.findByIdAndDelete(req.params.id);
    if (!deletedBarMenu) {
      return res.status(404).json({ message: "BarMenu not found" });
    }
    res.status(200).json(deletedBarMenu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;