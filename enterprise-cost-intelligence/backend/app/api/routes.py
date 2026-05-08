from fastapi import APIRouter, HTTPException, File, UploadFile
from typing import List
from ..models.schemas import Transaction, AnalysisResponse, ActionRecommendation, ExecutionResult, SimulationRequest, SimulationResponse, SimulationPoint, AuditLogEntry
from ..agents.data_agent import DataAgent
from ..agents.detection_agent import DetectionAgent
from ..agents.reasoning_agent import ReasoningAgent
from ..agents.action_agent import ActionAgent
from ..agents.impact_agent import ImpactAgent
from ..data.sample_data import generate_sample_data

import pandas as pd
import io
import uuid
from datetime import datetime
import httpx
import json

router = APIRouter()

# Instantiate agents
# Realistically, this might use dependency injection in a larger app
data_agent = DataAgent()
detection_agent = DetectionAgent()
reasoning_agent = ReasoningAgent()
action_agent = ActionAgent()
impact_agent = ImpactAgent()

# Global state for demo purposes
current_anomalies = []
current_actions = []
audit_logs = []

@router.post("/upload-data", response_model=dict)
async def upload_data(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    data_agent.load_from_dataframe(df)
    
    return {"status": "success", "message": f"Loaded {len(data_agent.get_transactions())} transactions."}

@router.post("/generate-sample-data")
async def generate_mock_data():
    """Endpoint for generating sample data without requiring a file upload."""
    df = generate_sample_data()
    data_agent.load_from_dataframe(df)
    return {"status": "success", "message": f"Generated and loaded {len(data_agent.get_transactions())} simulated transactions."}

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_data():
    global current_anomalies, current_actions
    transactions = data_agent.get_transactions()
    if not transactions:
        raise HTTPException(status_code=400, detail="No data available to analyze.")
        
    # Detection
    raw_anomalies = detection_agent.detect_anomalies(transactions)
    
    # Reasoning
    anomalies = reasoning_agent.explain_anomalies(raw_anomalies)
    
    # Actions
    actions = action_agent.suggest_actions(anomalies)
    
    # Impact
    total_spend = sum([t.amount for t in transactions if not t.resolved])
    impact_agent.set_total_spend(total_spend)
    impact_agent.update_potential_impact(anomalies)
    
    # Update global state
    current_anomalies = anomalies
    current_actions = actions
    
    return AnalysisResponse(
        anomalies=anomalies,
        actions=actions,
        impact=impact_agent.get_report(),
        sla_warnings=data_agent.detect_sla_risks()
    )

import random

@router.post("/stream-transaction", response_model=AnalysisResponse)
async def stream_transaction():
    """Generates a single simulated transaction and triggers analysis."""
    import uuid
    from datetime import datetime
    vendors = ["AWS", "Google Cloud", "Azure", "GitHub", "Salesforce", "Zoom", "Datadog"]
    categories = ["Cloud Infrastructure", "SaaS", "Software Licenses"]
    accounts = ["Engineering", "Operations", "Sales"]
    
    vendor = random.choice(vendors)
    base_amount = random.uniform(100, 5000)
    
    # Small chance of anomaly
    if vendor == "AWS" and random.random() < 0.1:
        base_amount *= 10
    elif vendor == "Datadog" and random.random() < 0.1:
        base_amount *= 5
        
    txn = Transaction(
        id=str(uuid.uuid4()),
        date=datetime.now().strftime("%Y-%m-%d"),
        vendor=vendor,
        category=random.choice(categories),
        amount=round(base_amount, 2),
        description=f"Auto-generated stream for {vendor}",
        account=random.choice(accounts)
    )
    
    data_agent.add_transaction(txn)
    
    # Re-run analysis
    return await analyze_data()

@router.post("/inject-transaction", response_model=AnalysisResponse)
async def inject_transaction(txn: Transaction):
    """Injects a specific transaction payload and triggers analysis."""
    import uuid
    if not txn.id:
        txn.id = str(uuid.uuid4())
    data_agent.add_transaction(txn)
    
    # Re-run analysis
    return await analyze_data()

@router.get("/anomalies", response_model=List[dict])
async def get_anomalies():
    # Return both anomalies and their corresponding action
    result = []
    for anomaly in current_anomalies:
        action = next((a for a in current_actions if a.anomaly_id == anomaly.id), None)
        item = anomaly.model_dump()
        item['action'] = action.model_dump() if action else None
        result.append(item)
    return result
    
@router.post("/action/execute/{action_id}", response_model=AnalysisResponse)
async def execute_action(action_id: str):
    global current_anomalies, current_actions, audit_logs
    action = next((a for a in current_actions if a.id == action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found.")
        
    anomaly = next((a for a in current_anomalies if a.id == action.anomaly_id), None)
    if not anomaly:
         raise HTTPException(status_code=404, detail="Corresponding anomaly not found.")
         
    # Execute
    result = action_agent.execute_action(action, anomaly)
    
    # Persist resolution state in the data agent
    data_agent.mark_resolved(anomaly.transaction_id)
    
    # SMART DUPLICATE RESOLUTION:
    if anomaly.type == "Duplicate Payment":
        transactions = data_agent.get_transactions()
        resolved_txn = next((t for t in transactions if t.id == anomaly.transaction_id), None)
        if resolved_txn:
            for t in transactions:
                if (not t.resolved and 
                    t.vendor.strip().lower() == resolved_txn.vendor.strip().lower() and 
                    t.amount == resolved_txn.amount and 
                    t.date.strip() == resolved_txn.date.strip() and
                    t.id != resolved_txn.id):
                    data_agent.mark_resolved(t.id)
    
    # Record Impact
    impact_agent.record_savings(
        actual_savings=result.actual_savings,
        prevented_loss=result.prevented_loss,
        projected_monthly=result.projected_savings_monthly,
        projected_yearly=result.projected_savings_yearly
    )
    
    # Record Audit Log
    audit_logs.append(AuditLogEntry(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow().isoformat() + "Z",
        anomaly_type=anomaly.type,
        vendor=anomaly.vendor,
        action_taken=action.action_type,
        impact=result.actual_savings + result.prevented_loss + result.projected_savings_monthly,
        factors=anomaly.factors_detected
    ))
    
    # Remove from active lists
    current_anomalies = [a for a in current_anomalies if a.id != anomaly.id]
    current_actions = [a for a in current_actions if a.id != action.id]
    
    # Sync Impact Agent with current outstanding threats
    impact_agent.update_potential_impact(current_anomalies)
    
    return AnalysisResponse(
        anomalies=current_anomalies,
        actions=current_actions,
        impact=impact_agent.get_report(),
        sla_warnings=data_agent.detect_sla_risks()
    )

@router.get("/impact", response_model=dict)
async def get_impact():
    return impact_agent.get_report().model_dump()

@router.get("/audit-log", response_model=List[AuditLogEntry])
async def get_audit_log():
    return sorted(audit_logs, key=lambda x: x.timestamp, reverse=True)

@router.post("/simulate-impact", response_model=SimulationResponse)
async def simulate_impact(request: SimulationRequest):
    global current_actions
    chart_data = []
    total_projected = 0.0
    
    for a_id in request.action_ids:
        action = next((a for a in current_actions if a.id == a_id), None)
        if action:
            total_projected += action.estimated_savings
            
    base_cost = 12000
    for i in range(30):
        # baseline trend goes up slightly
        baseline = base_cost + (i * 100) 
        
        # simulated cost drops after day 5 if actions are taken (gradual realization)
        if i > 5 and len(request.action_ids) > 0:
            daily_savings = (total_projected / 30) * (min(i - 5, 10) / 10) 
            cost = baseline - daily_savings
        else:
            cost = baseline + 50
            
        chart_data.append(SimulationPoint(
            name=f"Day {i+1}",
            cost=cost,
            baseline=baseline
        ))
        
    return SimulationResponse(
        projected_chart_data=chart_data,
        total_projected_savings=total_projected
    )

@router.post("/chat")
async def chat_with_ai(request: dict):
    """Proxy for Ollama Chat using qwen2.5vl:7b"""
    prompt = request.get("prompt", "")
    history = request.get("history", [])
    
    # Enrich prompt with context from current dashboard
    context_prefix = ""
    if current_anomalies:
        context_prefix = f"Current Dashboard Context: There are {len(current_anomalies)} active financial anomalies. "
        for a in current_anomalies[:3]:
            context_prefix += f"- {a.type} at {a.vendor} for ₹{a.amount}. "
        context_prefix += "\n\nUser Question: "

    full_prompt = context_prefix + prompt
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5vl:7b",
                    "prompt": full_prompt,
                    "stream": False,
                    "system": "You are Nexus AI, a financial cost optimization expert. Be concise and professional."
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                return {"response": "Error: Ollama service unavailable or model not found."}
                
            result = response.json()
            return {"response": result.get("response", "No response from AI.")}
            
    except Exception as e:
        return {"response": f"Connection error: Please ensure Ollama is running and qwen2.5vl:7b is pulled. Details: {str(e)}"}
