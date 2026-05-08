import pandas as pd
import numpy as np
from typing import List, Dict
from sklearn.ensemble import IsolationForest
from app.models.schemas import Transaction, Anomaly

class DetectionAgent:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        
    def detect_anomalies(self, transactions: List[Transaction]) -> List[dict]:
        if not transactions:
            return []
            
        df = pd.DataFrame([t.model_dump() for t in transactions])
        df['amount_num'] = pd.to_numeric(df['amount'])
        
        # Feature engineering for the model
        # Simple example: just amount and maybe frequency encoding of vendor
        vendor_counts = df['vendor'].value_counts()
        df['vendor_freq'] = df['vendor'].map(vendor_counts)
        
        features = df[['amount_num', 'vendor_freq']].fillna(0)
        
        # Isolation forest for statistical outliers
        self.model.fit(features)
        df['is_outlier'] = self.model.predict(features)
        
        anomalies_raw = []
        
        # 1. Rule based: Duplicate Payments (Run first to prioritize this label)
        # Create a normalized version for comparison
        df['vendor_norm'] = df['vendor'].str.strip().str.lower()
        df['date_norm'] = df['date'].str.strip()
        
        duplicates = df[df.duplicated(subset=['vendor_norm', 'amount', 'date_norm'], keep=False)]
        for _, row in duplicates.iterrows():
            if not row.get('resolved', False):
                anomalies_raw.append({
                    "transaction_id": row['id'],
                    "vendor": row['vendor'],
                    "amount": row['amount_num'],
                    "date": row['date'],
                    "type": "Duplicate Payment",
                    "risk_level": "high"
                })
                
        # 2. Statistical Isolation Forest Anomalies (Spikes)
        outliers = df[df['is_outlier'] == -1]
        for _, row in outliers.iterrows():
            # Avoid double adding if already found as duplicate
            if row['id'] not in [a['transaction_id'] for a in anomalies_raw] and not row.get('resolved', False):
                anomalies_raw.append({
                    "transaction_id": row['id'],
                    "vendor": row['vendor'],
                    "amount": row['amount_num'],
                    "date": row['date'],
                    "type": "Spike in Usage",
                    "risk_level": "high" if row['amount_num'] > df['amount_num'].mean() * 3 else "medium"
                })
            
        # 3. Rule based: Unused Services
        unused_vendors = ["LegacyCRM", "OldCloudHost"]
        unused_txns = df[df['vendor_norm'].isin([v.lower() for v in unused_vendors])]
        for _, row in unused_txns.iterrows():
            if row['id'] not in [a['transaction_id'] for a in anomalies_raw] and not row.get('resolved', False):
                anomalies_raw.append({
                    "transaction_id": row['id'],
                    "vendor": row['vendor'],
                    "amount": row['amount_num'],
                    "date": row['date'],
                    "type": "Unused License",
                    "risk_level": "medium"
                })
                
        return anomalies_raw
