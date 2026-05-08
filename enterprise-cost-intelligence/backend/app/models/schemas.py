from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Transaction(BaseModel):
    id: str
    date: str
    vendor: str
    category: str
    amount: float
    description: Optional[str] = None
    account: str
    resolved: bool = False

class Anomaly(BaseModel):
    id: str
    transaction_id: str
    vendor: str
    amount: float
    date: str
    risk_level: str  # "high", "medium", "low"
    type: str  # e.g., "Duplicate Payment", "Spike in Usage", "Unused License"
    explanation: str
    confidence: float
    factors_detected: List[str] = []
    rules_triggered: List[str] = []
    anomaly_score: float = 0.0
    alternative_actions: List[str] = []

class ActionRecommendation(BaseModel):
    id: str
    anomaly_id: str
    action_type: str  # e.g., "Stop Payment", "Flag Transaction", "Downgrade License"
    description: str
    estimated_savings: float

class ExecutionResult(BaseModel):
    success: bool
    message: str
    transaction_id: str
    action_taken: str
    actual_savings: float
    prevented_loss: float = 0.0
    projected_savings_monthly: float = 0.0
    projected_savings_yearly: float = 0.0

class ImpactReport(BaseModel):
    total_anomalies_detected: int
    total_potential_savings: float
    total_actual_savings: float
    total_spend: float = 0.0
    prevented_loss: float = 0.0
    projected_savings_monthly: float = 0.0
    projected_savings_yearly: float = 0.0
    resolved_anomalies: int

class SLAWarning(BaseModel):
    id: str
    type: str  # "Cost Spike" or "SLA Risk"
    message: str
    predicted_loss: float
    suggested_action: str
    days_to_impact: int

class AnalysisResponse(BaseModel):
    anomalies: List[Anomaly]
    actions: List[ActionRecommendation]
    impact: ImpactReport
    sla_warnings: List[SLAWarning] = []

class SimulationRequest(BaseModel):
    action_ids: List[str]
    time_horizon_months: int

class SimulationPoint(BaseModel):
    name: str
    cost: float
    baseline: float

class SimulationResponse(BaseModel):
    projected_chart_data: List[SimulationPoint]
    total_projected_savings: float

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    anomaly_type: str
    vendor: str
    action_taken: str
    impact: float
    factors: List[str] = []
