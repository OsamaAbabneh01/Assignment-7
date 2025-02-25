const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const mammoth = require("mammoth");

const router = express.Router();
const getFilePath = (fileName) => path.join(__dirname, "..", "storage", path.basename(fileName));

router.get("/read", async (req, res) => {
  if (!req.query.fileName) 
    return res.status(400).json({ error: "filename is required" });

  if (path.extname(req.query.fileName).toLowerCase() !== ".docx")
    return res.status(400).json({ error: "Only docx files are allowed" });
  
  try {
    let data = await fs.readFile(getFilePath(req.query.fileName));
    let result = await mammoth.extractRawText({ buffer: data });
    result = result.value;
    return res.status(200).json({ content: result });
  } 
  
  catch 
  {
    return res.status(404).json({ error: "file not found" });
  }
});

router.post("/write", async (req, res) => {
  if (!req.body.fileName)
    return res.status(400).json({ error: "filename is required" });

  if (path.extname(req.body.fileName).toLowerCase() !== ".docx")
    return res.status(400).json({ error: "Only docx files are allowed" });

  try {
    await fs.writeFile(getFilePath(req.body.fileName), req.body.content);
    res.status(201).json({ message: "data was writen successfully" });
  } 
  
  catch (err) {
    res.status(500).json({ error: "error when write in file" });
  }
});

router.post("/append", async (req, res) => {
  if (!req.body.fileName || !req.body.content)
    return res.status(400).json({error: "both file name and content required"});

  if (path.extname(req.body.fileName).toLowerCase() !== ".docx")
    return res.status(400).json({error: "Only docx files are allowed"});

  try {
    await fs.appendFile(getFilePath(req.body.fileName),`\n${req.body.content}`);
    res.status(201).json({ message: "data was updated successfully" });
  } 
  
  catch {
    res.status(500).json({ error: "error when append into file" });
  }
});

router.put("/rename", async (req, res) => {
    const { oldName, newName } = req.body;

    if (!oldName || !newName)
        return res.status(400).json({ error: "both file names are required" });

    if ( path.extname(oldName).toLowerCase() !== ".docx" || path.extname(newName).toLowerCase() !== ".docx")
        return res.status(400).json({ error: "Only docx files are allowed" });

    try {
        await fs.rename(getFilePath(oldName), getFilePath(newName));
        res.json({ message: "file renamed successfully" });
    } 
    
    catch {
        res.status(500).json({ error: "file not found" });
    }
});

router.delete("/delete", async (req, res) => {
  const { fileName } = req.body;

  if (!fileName)
    return res.status(400).json({ error: "file name is required" });

  if (path.extname(fileName).toLowerCase() !== ".docx")
    return res.status(400).json({ error: "Only docx files are allowed" });

  try 
  {
    await fs.rm(getFilePath(fileName));
    return res.json({ message: "file deleted successfully" });
  } 
  
  catch 
  {
    return res.status(500).json({ error: "file not found" });
  }
});

module.exports = router;
