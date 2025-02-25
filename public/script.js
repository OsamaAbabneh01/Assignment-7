const apiURL = "http://localhost:3000/api";

async function readFile() 
{
    const filename = document.getElementById("filename").value;
    const res = await fetch(`${apiURL}/read?fileName=${filename}`);
    const data = await res.json();
    document.getElementById("readFileResponse").textContent = data.content || data.error;    
}

document.getElementById("writeButton").addEventListener("click", writeToFile);

async function writeToFile(event) 
{
    event.preventDefault();
    const fileName = document.getElementById("filename-write").value;
    const content = document.getElementById("content-write").value;
    let res = await fetch(`${apiURL}/write`, {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({fileName, content})
    });
    res = await res.json();
    document.getElementById("writeFileResponse").textContent = res.message || res.error;
}

async function appendToFile() 
{
    const fileName = document.getElementById("filename-append").value;
    const content = document.getElementById("content-append").value;
    let res = await fetch(`${apiURL}/append`, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({fileName, content})
    });
    res = await res.json();
    document.getElementById("appendFileResponse").textContent = res.message || res.error;
}

async function deleteFile() 
{
    const fileName = document.getElementById("filename-delete").value;
    let res = await fetch(`${apiURL}/delete`, {
        method:"DELETE",
        headers: {"content-type":"application/json"},
        body: JSON.stringify({fileName})
    });
    res = await res.json();
    document.getElementById("deleteFileResponse").textContent = res.message || res.error;
}

async function renameFile() {
    let oldName = document.getElementById("oldFileName").value;
    let newName = document.getElementById("newFileName").value;
    let res = await fetch(`${apiURL}/rename`, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({oldName, newName})
    });
    res = await res.json();
    document.getElementById("renameFileResponse").textContent = res.message || res.error;
}