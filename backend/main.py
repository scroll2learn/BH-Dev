from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import subprocess
import psycopg2
import mysql.connector
from typing import List


app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite DB
def init_sqlite():
    conn = sqlite3.connect("demo.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            department TEXT,
            salary INTEGER
        )
    ''')
    cursor.execute('SELECT COUNT(*) FROM employees')
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO employees (name, department, salary)
            VALUES (?, ?, ?)
        ''', [
            ("Alice", "Engineering", 70000),
            ("Bob", "Sales", 50000),
            ("Charlie", "HR", 45000)
        ])
    conn.commit()
    conn.close()

init_sqlite()

# ✅ Models
class DataSource(BaseModel):
    datasourceType: str
    displayName: str
    host: str
    port: str
    databaseName: str
    username: str
    password: str

class TableRequest(BaseModel):
    datasourceType: str
    host: str
    port: str
    databaseName: str
    username: str
    password: str

# ✅ /connect endpoint
@app.post("/connect")
def connect_datasource(data: DataSource):
    db_type = data.datasourceType.strip().lower()

    try:
        if db_type == "postgresql":
            conn = psycopg2.connect(
                host=data.host,
                port=data.port,
                dbname=data.databaseName,
                user=data.username,
                password=data.password
            )
            conn.close()
            return {"status": "success", "message": "Connected to PostgreSQL successfully!"}

        elif db_type == "mysql":
            conn = mysql.connector.connect(
                host=data.host,
                port=int(data.port),
                database=data.databaseName,
                user=data.username,
                password=data.password
            )
            conn.close()
            return {"status": "success", "message": "Connected to MySQL successfully!"}

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported datasource type: {data.datasourceType}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")

# ✅ /execute endpoint
@app.post("/execute")
async def execute_code(request: Request):
    body = await request.json()
    code = body.get("code", "")
    language = body.get("language", "")

    if language == "python":
        try:
            result = subprocess.check_output(
                ["python3", "-c", code], stderr=subprocess.STDOUT, timeout=5
            )
            return {"output": result.decode()}
        except subprocess.CalledProcessError as e:
            return {"output": e.output.decode()}
        except Exception as e:
            return {"output": str(e)}

    elif language == "sql":
        try:
            conn = sqlite3.connect("demo.db")
            cursor = conn.cursor()
            cursor.execute(code)
            rows = cursor.fetchall()
            headers = [desc[0] for desc in cursor.description] if cursor.description else []
            conn.commit()
            conn.close()

            if not rows:
                return {"output": "Query executed successfully (no results)."}

            output = "\t".join(headers) + "\n"
            output += "\n".join("\t".join(map(str, row)) for row in rows)
            return {"output": output}

        except Exception as e:
            return {"output": f"SQL Error: {str(e)}"}

    return {"output": "Unsupported language"}

# ✅ /tables endpoint
@app.post("/tables", response_model=List[str])
def list_tables(data: TableRequest):
    db_type = data.datasourceType.strip().lower()

    try:
        if db_type == "mysql":
            conn = mysql.connector.connect(
                host=data.host,
                port=int(data.port),
                database=data.databaseName,
                user=data.username,
                password=data.password
            )
            cursor = conn.cursor()
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            return tables

        elif db_type == "postgresql":
            conn = psycopg2.connect(
                host=data.host,
                port=data.port,
                dbname=data.databaseName,
                user=data.username,
                password=data.password
            )
            cursor = conn.cursor()
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
            """)
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            return tables

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported datasource type: {data.datasourceType}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tables: {str(e)}")

# ✅ /columns endpoint
@app.post("/columns")
def get_columns(data: TableRequest, table: str = Query(...)):
    db_type = data.datasourceType.strip().lower()

    try:
        if db_type == "mysql":
            conn = mysql.connector.connect(
                host=data.host,
                port=int(data.port),
                database=data.databaseName,
                user=data.username,
                password=data.password
            )
            cursor = conn.cursor()
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            conn.close()
            return {"columns": columns}

        elif db_type == "postgresql":
            conn = psycopg2.connect(
                host=data.host,
                port=data.port,
                dbname=data.databaseName,
                user=data.username,
                password=data.password
            )
            cursor = conn.cursor()
            cursor.execute(f"""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '{table}'
            """)
            columns = cursor.fetchall()
            conn.close()
            return {"columns": columns}

        else:
            raise HTTPException(status_code=400, detail="Unsupported datasource type")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching columns: {str(e)}")
