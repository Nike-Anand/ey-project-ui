from app.models.schemas import ImpactReport

class ImpactAgent:
    def __init__(self):
        self.state = {
            "total_anomalies_detected": 0,
            "total_potential_savings": 0.0,
            "total_actual_savings": 0.0,
            "total_spend": 0.0,
            "prevented_loss": 0.0,
            "projected_savings_monthly": 0.0,
            "projected_savings_yearly": 0.0,
            "resolved_anomalies": 0
        }

    def set_total_spend(self, total: float):
        self.state["total_spend"] = total

    def update_potential_impact(self, anomalies: list):
        self.state["total_anomalies_detected"] = len(anomalies)
        self.state["total_potential_savings"] = sum([a.amount for a in anomalies])

    def record_savings(self, actual_savings: float, prevented_loss: float = 0.0, projected_monthly: float = 0.0, projected_yearly: float = 0.0):
        self.state["total_actual_savings"] += actual_savings
        self.state["prevented_loss"] += prevented_loss
        self.state["projected_savings_monthly"] += projected_monthly
        self.state["projected_savings_yearly"] += projected_yearly
        self.state["resolved_anomalies"] += 1

    def get_report(self) -> ImpactReport:
        return ImpactReport(**self.state)
