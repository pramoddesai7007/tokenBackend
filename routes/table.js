

const express = require('express');
const Section = require('../models/Section');
const Table = require('../models/Table');
const router = express.Router();


// Create tables API according to sections
// router.post('/:sectionId/tables', async (req, res) => {
//     const { sectionId } = req.params;
//     const { numberOfTables } = req.body; // Assuming numberOfTables is a number

//     try {
//         const section = await Section.findById(sectionId);

//         if (!section) {
//             return res.status(404).json({ message: 'Section not found' });
//         }

//         // Check if the provided number of tables is valid
//         if (!Number.isInteger(numberOfTables) || numberOfTables <= 0) {
//             return res.status(400).json({ message: 'Invalid number of tables provided' });
//         }

//         const existingTableNames = new Set(section.tableNames.map(table => table.tableName)); // Using Set for efficient lookup

//         // Determine the highest numbered table already present
//         let highestTableNumber = 0;
//         existingTableNames.forEach(tableName => {
//             const match = tableName.match(/\d+/);
//             if (match) {
//                 const tableNumber = parseInt(match[0], 10);
//                 if (!isNaN(tableNumber) && tableNumber > highestTableNumber) {
//                     highestTableNumber = tableNumber;
//                 }
//             }
//         });

//         const savedTables = [];
//         for (let i = 0; i < numberOfTables; i++) {
//             let tableNumber = highestTableNumber + i + 1;
//             let tableName = '';

//             // Check if the section name is "room section" to prefix table names with "R"
//             if (section.name.toLowerCase() === 'room section') {
//                 tableName = `ROOM${tableNumber}`;
//             } else {
//                 tableName = `${tableNumber}`;
//             }

//             // Check if the generated table name already exists in the section
//             while (existingTableNames.has(tableName)) {
//                 tableNumber++;
//                 tableName = `${tableNumber}`;
//             }

//             // Create and save the new table
//             const newTable = new Table({
//                 tableName,
//                 section: { name: section.name, _id: sectionId }
//             });
//             const savedTable = await newTable.save();
//             savedTables.push(savedTable);

//             // Update the Set of existing table names
//             existingTableNames.add(tableName);

//             // Update the Section document with the new table name and table ID
//             section.tableNames.push({ tableName: savedTable.tableName, tableId: savedTable._id });
//         }

//         // Save the updated section with new table names and table IDs
//         await section.save();

//         res.status(201).json(savedTables);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


// router.post('/:sectionId/tables', async (req, res) => {
//     const { sectionId } = req.params;
//     const { numberOfTables } = req.body; // Assuming numberOfTables is a number

//     try {
//         const section = await Section.findById(sectionId);

//         if (!section) {
//             return res.status(404).json({ message: 'Section not found' });
//         }

//         // Check if the provided number of tables is valid
//         if (!Number.isInteger(numberOfTables) || numberOfTables <= 0) {
//             return res.status(400).json({ message: 'Invalid number of tables provided' });
//         }

//         const existingTableNames = new Set(section.tableNames.map(table => table.tableName)); // Using Set for efficient lookup

//         // Determine the highest numbered table already present
//         let highestTableNumber = 0;
//         existingTableNames.forEach(tableName => {
//             const match = tableName.match(/\d+/);
//             if (match) {
//                 const tableNumber = parseInt(match[0], 10);
//                 if (!isNaN(tableNumber) && tableNumber > highestTableNumber) {
//                     highestTableNumber = tableNumber;
//                 }
//             }
//         });

//         const savedTables = [];
//         for (let i = 0; i < numberOfTables; i++) {
//             let mainTableNumber = highestTableNumber + i + 1;
//             let mainTableName = '';

//             // Check if the section name is "room section" to prefix table names with "R"
//             if (section.name.toLowerCase() === 'room section') {
//                 mainTableName = `ROOM${mainTableNumber}`;
//             } else {
//                 mainTableName = `${mainTableNumber}`;
//             }

//             // Check if the generated main table name already exists in the section
//             while (existingTableNames.has(mainTableName)) {
//                 mainTableNumber++;
//                 mainTableName = `${mainTableNumber}`;
//             }

//             // Create and save the main table
//             const mainTable = new Table({
//                 tableName: mainTableName,
//                 section: { name: section.name, _id: sectionId }
//             });
//             const savedMainTable = await mainTable.save();

//             // Create and save the subtables
//             const subTableLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
//             for (let j = 0; j < subTableLetters.length; j++) {
//                 const subTableName = `${mainTableNumber}${subTableLetters[j]}`;
//                 const subTable = new Table({
//                     tableName: subTableName,
//                     section: { name: section.name, _id: sectionId },
//                     parentTable: savedMainTable._id // Assuming parentTable field in Table schema to link main table
//                 });
//                 const savedSubTable = await subTable.save();
//                 savedTables.push(savedSubTable);
//                 existingTableNames.add(subTableName);
//                 section.tableNames.push({ tableName: savedSubTable.tableName, tableId: savedSubTable._id });
//             }

//             // Update the Set of existing table names
//             existingTableNames.add(mainTableName);

//             // Update the Section document with the new table names and table IDs
//             section.tableNames.push({ tableName: savedMainTable.tableName, tableId: savedMainTable._id });
//         }

//         // Save the updated section with new table names and table IDs
//         await section.save();

//         res.status(201).json(savedTables);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

router.post('/:sectionId/tables', async (req, res) => {
    const { sectionId } = req.params;
    const { numberOfTables } = req.body; // Assuming numberOfTables is a number

    try {
        const section = await Section.findById(sectionId);

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Check if the provided number of tables is valid
        if (!Number.isInteger(numberOfTables) || numberOfTables <= 0) {
            return res.status(400).json({ message: 'Invalid number of tables provided' });
        }

        const existingTableNames = new Set(section.tableNames.map(table => table.tableName)); // Using Set for efficient lookup

        // Determine the highest numbered table already present
        let highestTableNumber = 0;
        existingTableNames.forEach(tableName => {
            const match = tableName.match(/\d+/);
            if (match) {
                const tableNumber = parseInt(match[0], 10);
                if (!isNaN(tableNumber) && tableNumber > highestTableNumber) {
                    highestTableNumber = tableNumber;
                }
            }
        });

        const savedMainTables = [];
        for (let i = 0; i < numberOfTables; i++) {
            let mainTableNumber = highestTableNumber + i + 1;
            let mainTableName = '';

            // Check if the section name is "room section" to prefix table names with "R"
            if (section.name.toLowerCase() === 'room section') {
                mainTableName = `ROOM${mainTableNumber}`;
            } else {
                mainTableName = `${mainTableNumber}`;
            }

            // Check if the generated main table name already exists in the section
            while (existingTableNames.has(mainTableName)) {
                mainTableNumber++;
                mainTableName = `${mainTableNumber}`;
            }

            // Create and save the main table
            const mainTable = new Table({
                tableName: mainTableName,
                section: { name: section.name, _id: sectionId },
                splitTables: [], // Initialize splitTables array for main table
                isCalled: true
            });
            const savedMainTable = await mainTable.save();
            savedMainTables.push(savedMainTable);

            // Create and save the subtables
            const subTableLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
            for (let j = 0; j < subTableLetters.length; j++) {
                const subTableName = `${mainTableNumber}${subTableLetters[j]}`;
                const subTable = new Table({
                    tableName: subTableName,
                    section: { name: section.name, _id: sectionId },
                    parentTable: savedMainTable._id,// Assuming parentTable field in Table schema to link main table
                    isCalled: false // Set isCalled to false for subtable
                });
                const savedSubTable = await subTable.save();
                existingTableNames.add(subTableName);
                section.tableNames.push({ tableName: savedSubTable.tableName, tableId: savedSubTable._id });
                savedMainTable.splitTables.push(savedSubTable._id); // Add subtable ID to splitTables array of main table
            }

            // Update the Set of existing table names
            existingTableNames.add(mainTableName);

            // Update the Section document with the new table names and table IDs
            section.tableNames.push({ tableName: savedMainTable.tableName, tableId: savedMainTable._id });
        }

        // Save the updated section with new table names and table IDs
        await section.save();

        res.status(201).json(savedMainTables);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});




// Divide table API
router.post('/tables/:id/divide', async (req, res) => {
    const { id } = req.params;
    const { numberOfSubparts } = req.body; // Assuming numberOfSubparts is provided in the request body

    try {
        const originalTable = await Table.findById(id);

        if (!originalTable) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const sectionId = originalTable.section._id;

        // Ensure numberOfSubparts is a positive integer
        if (!Number.isInteger(numberOfSubparts) || numberOfSubparts <= 0) {
            return res.status(400).json({ message: 'Invalid number of subparts' });
        }

        const originalItems = originalTable.items || []; // Ensure items array exists

        // Calculate the number of items per subpart
        const itemsPerSubpart = Math.ceil(originalItems.length / numberOfSubparts);

        // Find existing subtables associated with the parent table and sort them alphabetically by name
        const existingSubtables = await Table.find({ parentTable: originalTable._id }).sort({ tableName: 1 });

        // Determine the next table name based on the last subtable's name
        let nextTableName = '';
        if (existingSubtables.length > 0) {
            const lastSubtable = existingSubtables[existingSubtables.length - 1];
            const lastTableName = lastSubtable.tableName;
            const lastAlphabet = lastTableName.split(' ')[1]; // Extract the last alphabet from the last subtable name
            nextTableName = `${originalTable.tableName} ${String.fromCharCode(lastAlphabet.charCodeAt(0) + 1)}`;
        } else {
            nextTableName = `${originalTable.tableName} A`; // If no subtables exist, start with alphabet 'A'
        }

        // Divide the items of the original table into subparts
        const subparts = [];
        for (let i = 0; i < numberOfSubparts; i++) {
            const startIndex = i * itemsPerSubpart;
            const endIndex = Math.min((i + 1) * itemsPerSubpart, originalItems.length);
            const subpartItems = originalItems.slice(startIndex, endIndex);

            // Create a new subpart object
            const subpart = new Table({
                tableName: nextTableName,
                section: originalTable.section,
                items: subpartItems,
                parentTable: originalTable._id // Store the parent table's ID for reference
            });

            const savedSubpart = await subpart.save();
            subparts.push(savedSubpart);

            // Increment the next table name alphabetically
            nextTableName = `${originalTable.tableName} ${String.fromCharCode(nextTableName.split(' ')[1].charCodeAt(0) + 1)}`;
        }

        res.status(200).json({ tableId: originalTable._id, subparts });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Define the route handler for fetching table by section and name
router.get('/table/bySectionAndName/:sectionId/:name', async (req, res) => {
    const { sectionId, name } = req.params;

    try {
        // Find the table by section ID and name
        const table = await Table.findOne({ "section._id": sectionId, tableName: name });

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // If found, return the table details
        res.status(200).json(table);
    } catch (error) {
        // Handle any errors that occur during the database query
        console.error('Error fetching table by section and name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// router.get('/tables/bySection/:sectionName/:name', async (req, res) => {
//     const { sectionName, mainTableName } = req.params;

//     try {
//         // Find the table by section ID and name
//         const table = await Table.findOne({ "section.name": sectionName, tableName: mainTableName });

//         if (!table) {
//             return res.status(404).json({ message: 'Table not found' });
//         }

//         // If found, return the table details
//         res.status(200).json(table);
//     } catch (error) {
//         // Handle any errors that occur during the database query
//         console.error('Error fetching table by section and name:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

router.get('/tables/bySection/:sectionName/:tableName', async (req, res) => {
    const { sectionName, tableName } = req.params;

    try {
        // Find the section by section name
        const section = await Section.findOne({ name: sectionName });

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Find the table by section name and table name
        const table = await Table.findOne({ "section.name": sectionName, tableName });

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // If found, return the table details
        res.status(200).json(table);
    } catch (error) {
        // Handle any errors that occur during the database query
        console.error('Error fetching table by section and name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE endpoint to delete a subtable of a table by tableId within a particular section
router.delete('/tables/:parentId/:sectionId/clearSubtables', async (req, res) => {
    const { parentId, sectionId } = req.params;

    try {
        // Find the parent table
        const parentTable = await Table.findById(parentId);

        if (!parentTable) {
            return res.status(404).json({ message: 'Parent table not found' });
        }

        // Ensure that the parent table belongs to the specified section
        if (parentTable.section !== sectionId) {
            return res.status(400).json({ message: 'Parent table does not belong to the specified section' });
        }

        // Find all subtables associated with the parent table
        const subtables = await Table.find({ parentTable: parentTable._id });

        // Delete all subtables
        await Table.deleteMany({ parentTable: parentTable._id });

        res.status(200).json({ message: 'Subtables deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});




// router.patch('/tables/:id', async (req, res) => {
//     const { id } = req.params;
//     const { tableName, sectionId } = req.body;

//     try {
//         const tableToUpdate = await Table.findById(id);

//         if (!tableToUpdate) {
//             return res.status(404).json({ message: 'Table not found' });
//         }

//         // Update the table name
//         tableToUpdate.tableName = tableName !== undefined ? tableName : tableToUpdate.tableName;

//         // If the table is associated with a section, update the association
//         if (sectionId && sectionId !== tableToUpdate.section?._id.toString()) {
//             const newSection = await Section.findById(sectionId);

//             if (!newSection) {
//                 return res.status(404).json({ message: 'Section not found' });
//             }

//             // Update the section reference in the table
//             tableToUpdate.section = { name: newSection.name, _id: newSection._id };
//         }

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


// router.patch('/tables/:id', async (req, res) => {
//     const { id } = req.params;
//     const { tableName } = req.body;

//     try {
//         const mainTable = await Table.findById(id);

//         if (!mainTable) {
//             return res.status(404).json({ message: 'Main table not found' });
//         }

//         // Extract the prefix of the new table name
//         const newMatches = tableName.match(/^(\d+)/);
//         const newPrefix = newMatches ? newMatches[1] : '';

//         // Update the main table name
//         mainTable.tableName = tableName;

//         // Save the updated main table
//         const updatedMainTable = await mainTable.save();

//         // Update subtables if any
//         const subtables = await Table.find({ parentTable: updatedMainTable._id });

//         for (const subtable of subtables) {
//             // Extract the suffix of the subtable name
//             const subMatches = subtable.tableName.match(/^\d+([A-Z]*)$/);
//             const subSuffix = subMatches ? subMatches[1] : '';

//             // Update the subtable name with the new main table prefix and the same suffix
//             subtable.tableName = newPrefix + subSuffix;
//             await subtable.save();
//         }

//         res.json(updatedMainTable);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


router.patch('/tables/:id', async (req, res) => {
    const { id } = req.params;
    const { tableName } = req.body;

    try {
        const mainTable = await Table.findById(id);

        if (!mainTable) {
            return res.status(404).json({ message: 'Main table not found' });
        }

        // Extract the prefix of the new table name
        const newMatches = tableName.match(/^(\d+)/);
        const newPrefix = newMatches ? newMatches[1] : '';

        // Update the main table name
        mainTable.tableName = tableName;

        // Save the updated main table
        const updatedMainTable = await mainTable.save();

        // Update subtables if any
        const subtables = await Table.find({ parentTable: updatedMainTable._id });

        for (const subtable of subtables) {
            // Extract the suffix of the subtable name
            const subMatches = subtable.tableName.match(/^\d+([A-Z]*)$/);
            const subSuffix = subMatches ? subMatches[1] : '';

            // Update the subtable name with the new main table prefix and the same suffix
            subtable.tableName = newPrefix + subSuffix;
            await subtable.save();
        }

        res.json(updatedMainTable);
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
// router.get('/tables', async (req, res) => {
//     try {
//         const tables = await Table.find();
//         res.json(tables);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

router.get('/tables', async (req, res) => {
    try {
        const tables = await Table.find({ isCalled: true });
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


// create split table
router.post('/tables/split/:tableId', async (req, res) => {
    const { tableId } = req.params;
    const { parts } = req.body; // Number of parts to split the table into

    try {
        // Find the main table by its ID
        const mainTable = await Table.findById(tableId);
        if (!mainTable) {
            return res.status(404).json({ error: 'Main table not found' });
        }

        // Split the main table into parts
        const splitTables = [];
        for (let i = 0; i < parts; i++) {
            const splitTableName = `${mainTable.tableName}${String.fromCharCode(65 + i)}`;
            const newSplitTable = {
                tableName: splitTableName,
                section: mainTable.section,
                parentTable: mainTable._id,
                //   tableId: mainTable._id,        // Add other fields specific to the tables here
            };
            mainTable.splitTables.push(newSplitTable); // Push the split table to the main table's array of split tables
            splitTables.push(newSplitTable);
        }

        // Save the main table with split tables
        await mainTable.save();

        // Return the split tables in the response
        res.json({ splitTables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});


// Split table
router.put('/:sectionId/:mainTableId/show-subtables', async (req, res) => {
    const { sectionId, mainTableId } = req.params;
    const { numberOfSubtablesToShow } = req.body; // Assuming numberOfSubtablesToShow is a number

    try {
        // Fetch the section by sectionId
        const section = await Section.findById(sectionId);

        // Check if the section exists
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Fetch the mainTable by mainTableId
        const mainTable = await Table.findById(mainTableId);

        if (!mainTable) {
            return res.status(404).json({ message: 'Main table not found' });
        }

        if (!Number.isInteger(numberOfSubtablesToShow) || numberOfSubtablesToShow <= 0) {
            return res.status(400).json({ message: 'Invalid number of subtables to show provided' });
        }

        // Fetch all subtables associated with the main table
        const subtables = await Table.find({ parentTable: mainTableId, isCalled: false }).sort({ tableName: 1 });

        if (subtables.length < numberOfSubtablesToShow) {
            return res.status(400).json({ message: 'All subtables are already shown' });
        }

        // Update isCalled property for the specified number of subtables
        for (let i = 0; i < numberOfSubtablesToShow; i++) {
            const subtable = subtables[i];
            subtable.isCalled = true;
            await subtable.save();
        }

        mainTable.isCalled = false;
        await mainTable.save();

        res.status(200).json({ message: `Successfully updated isCalled property for ${numberOfSubtablesToShow} subtables` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/section/byName/:sectionName', async (req, res) => {
    const { sectionName } = req.params;
  
    try {
      // Find the section by sectionName
      const section = await Section.findOne({ name: sectionName });
  
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      }
  
      // Return the sectionId
      res.status(200).json({ sectionId: section._id });
    } catch (error) {
      console.error('Error fetching section:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// get tableId by tableName
router.get('/table/byName/:tableName', async (req, res) => {
    const { tableName } = req.params;
  
    try {
      // Find the subtable by its tableName
      const subtable = await Table.findOne({ tableName });
  
      if (!subtable) {
        return res.status(404).json({ message: 'Subtable not found' });
      }
  
      // Extract the _id of the subtable
      const tableId = subtable._id;
  
      // If found, return the _id of the subtable
      res.status(200).json({ tableId });
    } catch (error) {
      // Handle any errors that occur during the database query
      console.error('Error fetching tableId by tableName:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// restore one table
router.put('/:tableId', async (req, res) => {
    const { tableId } = req.params;

    try {
        // Find the table by ID
        const table = await Table.findById(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Set isCalled property to false
        table.isCalled = false;

        // Save the updated table
        await table.save();

        res.status(200).json({ message: 'Table updated successfully', table });
    } catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// unsplit/ restored table again
router.put('/:sectionId/:mainTableId/reset-subtables', async (req, res) => {
    const { sectionId, mainTableId } = req.params;

    try {
        const mainTable = await Table.findById(mainTableId);

        if (!mainTable) {
            return res.status(404).json({ message: 'Main table not found' });
        }

        // Update the main table's isCalled property to true
        mainTable.isCalled = true;
        await mainTable.save();

        // Find all subtables associated with the main table and section
        const subtables = await Table.find({ parentTable: mainTableId, "section._id": sectionId });
        
        if (subtables.length === 0) {
            return res.status(404).json({ message: 'No subtables found for the main table and section' });
        }

        // Update isCalled property for each subtable to false
        await Promise.all(subtables.map(async (subtable) => {
            subtable.isCalled = false;
            await subtable.save();
        }));

        res.status(200).json({ message: 'Successfully reset isCalled property for subtables' });
    } catch (error) {
        console.error('Error resetting subtables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
