import uuid
from typing import List
from app.models.schemas import Anomaly

class ReasoningAgent:
    def explain_anomalies(self, raw_anomalies: List[dict]) -> List[Anomaly]:
        explained_anomalies = []
        
        for raw in raw_anomalies:
            explanation = self._generate_explanation(raw['type'], raw['vendor'], raw['amount'])
            structured = self._generate_structured_reasoning(raw['type'], raw['vendor'], raw['amount'])
            
            # Mocking confidence based on risk level
            confidence = 0.95 if raw['risk_level'] == 'high' else 0.82
            
            anomaly = Anomaly(
                id=str(uuid.uuid4()),
                transaction_id=raw['transaction_id'],
                vendor=raw['vendor'],
                amount=raw['amount'],
                date=raw['date'],
                risk_level=raw['risk_level'],
                type=raw['type'],
                explanation=explanation,
                confidence=confidence,
                factors_detected=structured['factors'],
                rules_triggered=structured['rules'],
                anomaly_score=structured['score'],
                alternative_actions=structured['alternatives']
            )
            explained_anomalies.append(anomaly)
            
        return explained_anomalies

    def _generate_structured_reasoning(self, a_type: str, vendor: str, amount: float) -> dict:
        if a_type == "Duplicate Payment":
            return {
                "factors": [f"Exact amount match (${amount:,.2f})", "Same vendor threshold", "Within 24h window"],
                "rules": ["duplicate_payment_detection_rule"],
                "score": 0.98,
                "alternatives": ["Manual Review", "Hold Future Payments"]
            }
        elif a_type == "Spike in Usage":
            return {
                "factors": ["300% deviation from 30-day MA", f"Vendor: {vendor}", f"Spike value: ${amount:,.2f}"],
                "rules": ["statistical_deviation_rule", "cost_velocity_rule"],
                "score": 0.88,
                "alternatives": ["Investigate Logs", "Contact Vendor"]
            }
        elif a_type == "Unused License":
            return {
                "factors": ["Zero active logins > 60 days", f"Recurring charge: ${amount:,.2f}"],
                "rules": ["dormant_account_rule"],
                "score": 0.92,
                "alternatives": ["Downgrade Tier", "Transfer License"]
            }
        return {
            "factors": ["Statistical anomaly detected"], "rules": ["default_deviation_rule"], "score": 0.70, "alternatives": []
        }
        
    def _generate_explanation(self, a_type: str, vendor: str, amount: float) -> str:
        """Uses 'LLM logic' (mocked via templating for speed/reliability in demo) to explain root cause."""
        if a_type == "Duplicate Payment":
            return f"{vendor} billed ${amount:,.2f} multiple times on the same day. This is a high-confidence duplicate invoice submission."
        elif a_type == "Spike in Usage":
            return f"A sudden spike in cloud/compute costs from {vendor}. The amount of ${amount:,.2f} is 300% higher than the historical 30-day moving average. Likely a forgotten compute cluster or unoptimized query."
        elif a_type == "Unused License":
            return f"{vendor} account shows zero active logins for the last 60 days, yet we are still paying ${amount:,.2f}. This is shadow IT or an abandoned SaaS license."
        return f"Detected unusual spending pattern for {vendor}."
