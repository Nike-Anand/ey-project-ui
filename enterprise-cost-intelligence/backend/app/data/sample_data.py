import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta

def generate_sample_data(num_records: int = 500) -> pd.DataFrame:
    """Generates synthetic enterprise expense data."""
    vendors = [
        "AWS", "Google Cloud", "Azure", "GitHub", "Salesforce", "Zoom",
        "Slack", "Atlassian", "Asana", "Datadog", "LegacyCRM", "OldCloudHost"
    ]
    categories = ["Cloud Infrastructure", "SaaS", "Telecommunications", "Software Licenses"]
    accounts = ["Engineering", "Sales", "Marketing", "HR", "Operations"]

    np.random.seed(42) # For reproducibility
    
    dates = [datetime.now() - timedelta(days=np.random.randint(0, 90)) for _ in range(num_records)]
    
    data = []
    for i in range(num_records):
        vendor = np.random.choice(vendors)
        # Normal amounts
        base_amount = np.random.lognormal(mean=5, sigma=1.5)
        
        # Inject Spikes for AWS occasionally
        if vendor == "AWS" and np.random.random() < 0.02:
            base_amount *= 10
            
        data.append({
            "id": str(uuid.uuid4()),
            "date": dates[i].strftime("%Y-%m-%d"),
            "vendor": vendor,
            "category": np.random.choice(categories),
            "amount": round(base_amount, 2),
            "description": f"Monthly invoice for {vendor}",
            "account": np.random.choice(accounts)
        })
        
    df = pd.DataFrame(data)
    
    # Inject exactly a duplicate
    dup_row = df.iloc[len(df)//2].copy()
    dup_row['id'] = str(uuid.uuid4())
    dup_row['date'] = df.iloc[len(df)//2]['date']  # Exactly same date
    df = pd.concat([df, pd.DataFrame([dup_row])], ignore_index=True)
    
    # Inject unused legacy service
    df = pd.concat([df, pd.DataFrame([{
        "id": str(uuid.uuid4()),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "vendor": "LegacyCRM",
        "category": "SaaS",
        "amount": 2999.00,
        "description": "Legacy system license",
        "account": "Sales"
    }])], ignore_index=True)

    return df
