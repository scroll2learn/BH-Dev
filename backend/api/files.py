from fastapi import APIRouter, Query, UploadFile, File, HTTPException
import os, shutil, mimetypes
from typing import List

router = APIRouter()

@router.get("/files/list")
def list_files(dirPath: str = Query(...)):
    if not os.path.isdir(dirPath):
        raise HTTPException(status_code=400, detail="Invalid directory path")

    files = []
    for name in os.listdir(dirPath):
        path = os.path.join(dirPath, name)
        stat = os.stat(path)
        files.append({
            "name": name,
            "path": path,
            "size": stat.st_size,
            "modified": stat.st_mtime,
            "created": stat.st_ctime,
            "mimeType": mimetypes.guess_type(path)[0],
            "isDirectory": os.path.isdir(path)
        })
    return files

@router.get("/files/stat")
def stat_file(filePath: str = Query(...)):
    if not os.path.exists(filePath):
        raise HTTPException(status_code=404, detail="File not found")

    stat = os.stat(filePath)
    return {
        "name": os.path.basename(filePath),
        "path": filePath,
        "size": stat.st_size,
        "modified": stat.st_mtime,
        "created": stat.st_ctime,
        "mimeType": mimetypes.guess_type(filePath)[0],
        "isDirectory": os.path.isdir(filePath)
    }

@router.get("/files/read")
def read_file(filePath: str = Query(...)):
    if not os.path.isfile(filePath):
        raise HTTPException(status_code=400, detail="Not a file")

    with open(filePath, 'r', encoding='utf-8') as f:
        return {"content": f.read()}

@router.post("/files/write")
def write_file(filePath: str = Query(...), file: UploadFile = File(...)):
    with open(filePath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "File saved successfully", "path": filePath}

@router.delete("/files/remove")
def delete_file(filePath: str = Query(...)):
    if not os.path.exists(filePath):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(filePath)
    return {"message": "File deleted", "path": filePath}

@router.get("/ping")
def ping():
    return {"status": "pong"}

@router.get("/cwd")
def get_cwd():
    return {"cwd": os.getcwd()}
