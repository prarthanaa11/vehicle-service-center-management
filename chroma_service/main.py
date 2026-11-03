
import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

# Create FastAPI application
app = FastAPI(title="Vehicle Service Center API")

# Allow requests from Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to existing ChromaDB storage
BASE_DIR = Path(__file__).resolve().parent.parent
CHROMA_PATH = BASE_DIR / "chroma_data"

client = chromadb.PersistentClient(
    path=str(CHROMA_PATH)
)

collection = client.get_or_create_collection(
    name="repair_history"
)


# Request format for adding repair history
class RepairRecord(BaseModel):
    repair_id: str
    description: str
    vehicle_number: str
    repair_type: str


# Request format for searching repair history
class RepairSearch(BaseModel):
    complaint: str
    results: int = 3


@app.get("/")
def home():
    return {
        "message": "Vehicle Service Center API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "ChromaDB connected"
    }


# Add a repair record to ChromaDB
@app.post("/repair-history")
def add_repair(record: RepairRecord):
    try:
        collection.upsert(
            ids=[record.repair_id],
            documents=[record.description],
            metadatas=[{
                "vehicle_number": record.vehicle_number,
                "repair_type": record.repair_type
            }]
        )

        return {
            "message": "Repair history saved successfully"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# Search similar historical repairs
@app.post("/repair-search")
def search_repairs(request: RepairSearch):
    try:
        if request.results < 1 or request.results > 10:
            raise HTTPException(
                status_code=400,
                detail="Results must be between 1 and 10"
            )

        if collection.count() == 0:
            return {
                "message": "No repair history available",
                "results": []
            }

        actual_results = min(
            request.results,
            collection.count()
        )

        results = collection.query(
            query_texts=[request.complaint],
            n_results=actual_results
        )

        records = []

        for i in range(len(results["ids"][0])):
            records.append({
                "repair_id": results["ids"][0][i],
                "description": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            })

        return {
            "message": "Similar repairs found",
            "results": records
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
