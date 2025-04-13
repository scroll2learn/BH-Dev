# backend/api/routes.py

from fastapi import APIRouter
from pydantic import BaseModel
import subprocess

router = APIRouter()

class CodeInput(BaseModel):
    code: str
    language: str

@router.post("/execute")
def execute_code(input: CodeInput):
    if input.language == "python":
        result = subprocess.run(
            ["python3", "-c", input.code],
            capture_output=True,
            text=True
        )
        return {"output": result.stdout or result.stderr}
    return {"output": "Language not supported yet"}
