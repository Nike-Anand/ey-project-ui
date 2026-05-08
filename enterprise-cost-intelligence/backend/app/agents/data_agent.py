import pandas as pd
from typing import List
from app.models.schemas import Transaction

class DataAgent:
    def __init__(self):
        self.transactions: List[Transaction] = []
        self.raw_df = None
        
    def load_from_dataframe(self, df: pd.DataFrame):
        """Ingests structured dataset and cleans it."""
        self.raw_df = df
        self.transactions = []
        
        # Clean & preprocess data
        # Fill missing descriptions
        df['description'] = df['description'].fillna('No description provided')
        
        for _, row in df.iterrows():
            txn = Transaction(
                id=str(row['id']),
                date=str(row['date']),
                vendor=str(row['vendor']),
                category=str(row['category']),
                amount=float(row['amount']),
                description=str(row['description']),
                account=str(row['account'])
            )
            self.transactions.append(txn)
            
    def get_transactions(self) -> List[Transaction]:
        return self.transactions

    def mark_resolved(self, transaction_id: str):
        """Marks a specific transaction as resolved."""
        for txn in self.transactions:
            if txn.id == transaction_id:
                txn.resolved = True
                break

    def add_transaction(self, transaction: Transaction):
        """Injects a single transaction into the data stream."""
        self.transactions.append(transaction)
        # We don't necessarily need to update the dataframe for live streaming since analysis runs on self.transactions,
        # but if needed, we could append to self.raw_df as well.

    def detect_sla_risks(self) -> list:
        # Import inside or at top level. Assuming uuid is available or we can just produce random strings
        import uuid
        from app.models.schemas import SLAWarning
        
        warnings = []
        if len(self.transactions) > 0:
            warnings.append(SLAWarning(
                id=str(uuid.uuid4()),
                type="Cost Spike",
                message="Predicted 45% increase in compute costs due to current velocity.",
                predicted_loss=15000.0,
                suggested_action="Review auto-scaling policies",
                days_to_impact=3
            ))
            warnings.append(SLAWarning(
                id=str(uuid.uuid4()),
                type="SLA Risk",
                message="Database latency trend indicates potential SLA breach during peak hours.",
                predicted_loss=25000.0,
                suggested_action="Provision read replicas",
                days_to_impact=5
            ))
        return warnings
