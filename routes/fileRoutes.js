const express = require("express");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const mammoth = require("mammoth");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const router = express.Router();
const getFilePath = (fileName) => path.join(__dirname, "..", "storage", path.basename(fileName));

router.get("/read", async (req, res) => {
  if (!req.query.fileName) 
    return res.status(400).json({ error: "filename is required" });

  if (path.extname(req.query.fileName).toLowerCase() !== ".docx")
    return res.status(400).json({ error: "Only docx files are allowed" });
  
  try {
    let data = await fsp.readFile(getFilePath(req.query.fileName));
    let result = await mammoth.extractRawText({buffer:data});
    return res.status(200).json({ content: result.value });
  } 
  
  catch 
  {
    return res.status(404).json({ error: "file not found" });
  }
});

router.post("/write", (req, res) => {
    if (!req.body.fileName)
        return res.status(400).json({ error: "filename is required" });

    if (path.extname(req.body.fileName).toLowerCase() !== ".docx")
        return res.status(400).json({ error: "Only docx files are allowed" });

    try 
    {
        const doc = new Document({
            sections:[{properties:{}, children:[new Paragraph({children:[new TextRun(req.body.content)]})]}]
        });
        Packer.toBuffer(doc).then((buffer) => {
            fs.writeFileSync(getFilePath(req.body.fileName), buffer);
            res.json({message:"File write successfully"});
        });
    } 
  
  catch {
    res.status(500).json({ error: "error when write in file" });
  }
});

router.post("/append", async (req, res) => {
  if (!req.body.fileName || !req.body.content)
    return res.status(400).json({error: "both file name and content required"});

  if (path.extname(req.body.fileName).toLowerCase() !== ".docx")
    return res.status(400).json({error: "Only docx files are allowed"});

  try 
  {
    let data = await fsp.readFile(getFilePath(req.body.fileName));
    let result = await mammoth.extractRawText({buffer:data});
    const doc = new Document({
      sections:[{properties:{}, children:[new Paragraph({children:[new TextRun(result.value)]}),
      new Paragraph({children:[new TextRun(req.body.content)]})
    ]}]
      });
      Packer.toBuffer(doc).then((buffer) => {
          fs.writeFileSync(getFilePath(req.body.fileName), buffer);
          res.json({message:"File write successfully"});
      });
  }
  
  catch(err) {
    res.status(500).json({ error: "file not found" });
  }
});

router.put("/rename", async (req, res) => {
    const { oldName, newName } = req.body;

    if (!oldName || !newName)
        return res.status(400).json({ error: "both file names are required" });

    if ( path.extname(oldName).toLowerCase() !== ".docx" || path.extname(newName).toLowerCase() !== ".docx")
        return res.status(400).json({ error: "Only docx files are allowed" });

    try {
        await fsp.rename(getFilePath(oldName), getFilePath(newName));
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
    await fsp.rm(getFilePath(fileName));
    return res.json({ message: "file deleted successfully" });
  } 
  
  catch
  {
    return res.status(500).json({ error: "file not found" });
  }
});

module.exports = router;