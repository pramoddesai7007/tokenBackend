// routes/tableRoutes.js
const express = require('express');
const Section = require('../models/Section');
const Table = require('../models/Table');
const router = express.Router();

// Create tables API according to sections
router.post('/:sectionId/tables', async (req, res) => {
    const { sectionId } = req.params;
    const { tableName } = req.body;

    try {
        const section = await Section.findById(sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        const newTable = new Table
            ({
                tableName,
                section: { name: section.name, _id: sectionId }
            });
        const savedTable = await newTable.save();

        console.log(savedTable._id)
        // Update the Section document with the new table name and table ID
        section.tableNames.push({ tableName: savedTable.tableName, tableId: savedTable._id });
        await section.save();

        res.status(201).json(savedTable);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Edit table API
// router.patch('/tables/:id', async (req, res) => {
//     const { id } = req.params;
//     const { tableName } = req.body;

//     try {
//         const tableToUpdate = await Table.findById(id);

//         if (!tableToUpdate) {
//             return res.status(404).json({ message: 'Table not found' });
//         }

//         // Update the table name
//         tableToUpdate.tableName = tableName !== undefined ? tableName : tableToUpdate.tableName;

//         const updatedTable = await tableToUpdate.save();

//         // If the table is associated with a section, update the section's table name
//         if (tableToUpdate.section && tableToUpdate.section._id) {
//             const section = await Section.findById(tableToUpdate.section._id);

//             if (section) {
//                 const tableIndex = section.tableNames.findIndex(
//                     (table) => table.tableId.toString() === updatedTable._id.toString()
//                 );

//                 if (tableIndex !== -1) {
//                     section.tableNames[tableIndex].tableName = updatedTable.tableName;
//                     await section.save();
//                 }
//             }
//         }

//         res.json(updatedTable);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

router.patch('/tables/:id', async (req, res) => {
    const { id } = req.params;
    const { tableName, sectionId } = req.body;

    try {
        const tableToUpdate = await Table.findById(id);

        if (!tableToUpdate) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Update the table name
        tableToUpdate.tableName = tableName !== undefined ? tableName : tableToUpdate.tableName;

        // If the table is associated with a section, update the association
        if (sectionId && sectionId !== tableToUpdate.section?._id.toString()) {
            const newSection = await Section.findById(sectionId);

            if (!newSection) {
                return res.status(404).json({ message: 'Section not found' });
            }

            // Update the section reference in the table
            tableToUpdate.section = { name: newSection.name, _id: newSection._id };
        }

        const updatedTable = await tableToUpdate.save();

        // If the table is associated with a section, update the section's table name
        if (tableToUpdate.section && tableToUpdate.section._id) {
            const section = await Section.findById(tableToUpdate.section._id);

            if (section) {
                const tableIndex = section.tableNames.findIndex(
                    (table) => table.tableId.toString() === updatedTable._id.toString()
                );

                if (tableIndex !== -1) {
                    section.tableNames[tableIndex].tableName = updatedTable.tableName;
                    await section.save();
                }
            }
        }

        res.json(updatedTable);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Delete table API
router.delete('/tables/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const tableToDelete = await Table.findByIdAndDelete(id);

        if (!tableToDelete) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const sectionId = tableToDelete.section ? tableToDelete.section._id : null;

        // If the table was associated with a section, remove table reference from the section
        if (sectionId) {
            const section = await Section.findById(sectionId);

            if (section) {
                section.tableNames = section.tableNames.filter(
                    (table) => table.tableId.toString() !== id.toString()
                );
                await section.save();
            }
        }

        res.json({ message: 'Table deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Get all tables List API
router.get('/tables', async (req, res) => {
    try {
        const tables = await Table.find();
        res.json(tables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Get Single Table API
router.get('/tables/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const table = await Table.findById(id);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json(table);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
