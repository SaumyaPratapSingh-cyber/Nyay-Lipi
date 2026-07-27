from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.agents.langgraph_orchestrator import LangGraphFIROrchestrator

app = FastAPI(
    title="Nyaya-Lipi AI Agent & Similarity Microservice",
    version="1.0.0",
    description="LangGraph Multi-Agent Orchestration & BNS Legal RAG Engine"
)

class TranscriptRequest(BaseModel):
    raw_transcript: str
    language_code: Optional[str] = "hi-IN"

class SimilarityRequest(BaseModel):
    ai_transcript: str
    officer_typed_text: str
    ai_sections: List[str]
    officer_sections: List[str]

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "Nyaya-Lipi Python AI Microservice",
        "engine": "LangGraph + BNS RAG Engine"
    }

@app.post("/api/v1/process-transcript")
def process_transcript(req: TranscriptRequest):
    try:
        if not req.raw_transcript.strip():
            raise HTTPException(status_code=400, detail="Transcript content cannot be empty")

        result = LangGraphFIROrchestrator.execute_pipeline(req.raw_transcript)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
