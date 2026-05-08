import uuid
from typing import List
from app.models.schemas import Anomaly, ActionRecommendation, ExecutionResult

class ActionAgent:
    def suggest_actions(self, anomalies: List[Anomaly]) -> List[ActionRecommendation]:
        actions = []
        for anomaly in anomalies:
            action_type, desc = self._determine_action(anomaly.type, anomaly.vendor)
            actions.append(ActionRecommendation(
                id=str(uuid.uuid4()),
                anomaly_id=anomaly.id,
                action_type=action_type,
                description=desc,
                estimated_savings=anomaly.amount
            ))
        return actions

    def _determine_action(self, a_type: str, vendor: str) -> tuple:
        if a_type == "Duplicate Payment":
            return "Halt Payment & Dispute", f"Automatically block the duplicate ACH transfer to {vendor} and send a dispute email to their billing department."
        elif a_type == "Spike in Usage":
            return "Auto-Scale Down", f"Trigger AWS Lambda to scale down idle instances for {vendor} development environments."
        elif a_type == "Unused License":
            return "Cancel Subscription", f"Revoke SSO access and terminate the {vendor} contract via API."
        return "Flag for Review", f"Flag this {vendor} transaction for manual FP&A review."

    def execute_action(self, action: ActionRecommendation, anomaly: Anomaly) -> ExecutionResult:
        """Simulates interacting with enterprise systems (ERP, AWS, SaaS APIs)."""
        actual_savings = 0.0
        prevented_loss = 0.0
        projected_monthly = 0.0
        projected_yearly = 0.0
        
        if anomaly.type == "Duplicate Payment":
            actual_savings = action.estimated_savings
        elif anomaly.type == "Spike in Usage":
            # Heuristic: For demo purposes, we distribute the spike impact across all metrics to demonstrate the UI capability fully
            actual_savings = action.estimated_savings * 0.15 # 15% immediate refund (e.g., spot instance credit)
            prevented_loss = action.estimated_savings * 1.5
            projected_monthly = action.estimated_savings * 0.35 # 35% ongoing optimization
            projected_yearly = projected_monthly * 12
        elif anomaly.type == "Unused License":
            # Heuristic: saving monthly cost going forward
            projected_monthly = action.estimated_savings
            projected_yearly = action.estimated_savings * 12

        return ExecutionResult(
            success=True,
            message=f"Successfully executed: {action.action_type}",
            transaction_id=anomaly.transaction_id,
            action_taken=action.action_type,
            actual_savings=actual_savings,
            prevented_loss=prevented_loss,
            projected_savings_monthly=projected_monthly,
            projected_savings_yearly=projected_yearly
        )
