# CleanPro Quick Start Guide

AI-optimized scheduling, quality control, and staff coordination to reduce cleaning costs and improve service quality. Get your first automated schedule running in under 5 minutes.

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Nexus Platform | 1.0.0+ | Plugin runtime environment |
| Node.js | 20+ | JavaScript runtime (for SDK) |
| API Key | - | Authentication |

## Installation Methods

### Method 1: Nexus Marketplace (Recommended)

1. Navigate to **Marketplace** in your Nexus Dashboard
2. Search for "CleanPro"
3. Click **Install** and select your pricing tier
4. The plugin activates automatically within 60 seconds

### Method 2: Nexus CLI

```bash
nexus plugin install nexus-cleaning
nexus config set CLEANING_API_KEY your-api-key-here
```

### Method 3: API Installation

```bash
curl -X POST https://api.adverant.ai/v1/plugins/install \
  -H "Authorization: Bearer YOUR_NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "pluginId": "nexus-cleaning",
    "tier": "professional",
    "autoActivate": true
  }'
```

---

## Your First Operation: Optimize a Cleaning Schedule

### Step 1: Set Your API Key

```bash
export NEXUS_API_KEY="your-api-key-here"
```

### Step 2: Generate an Optimized Schedule

```bash
curl -X POST "https://api.adverant.ai/proxy/cleaning/api/v1/schedules/optimize" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-02",
    "propertyIds": ["prop-001", "prop-002", "prop-003"],
    "availableStaff": ["staff-001", "staff-002"],
    "constraints": {
      "checkoutTime": "11:00",
      "checkinTime": "15:00"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduleId": "sched-abc123",
    "date": "2025-01-02",
    "assignments": [
      {
        "staffId": "staff-001",
        "propertyId": "prop-001",
        "startTime": "11:15",
        "estimatedDuration": 90,
        "priority": "high"
      }
    ],
    "efficiency": 0.94,
    "estimatedCost": 285.00
  }
}
```

---

## API Reference

**Base URL:** `https://api.adverant.ai/proxy/cleaning/api/v1`

### Optimize Cleaning Schedule
```bash
curl -X POST "https://api.adverant.ai/proxy/cleaning/api/v1/schedules/optimize" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-02",
    "propertyIds": ["prop-001"],
    "optimizeFor": "cost"
  }'
```

### List Cleaning Tasks
```bash
curl -X GET "https://api.adverant.ai/proxy/cleaning/api/v1/tasks?date=2025-01-02" \
  -H "Authorization: Bearer $NEXUS_API_KEY"
```

### Create Inspection Report
```bash
curl -X POST "https://api.adverant.ai/proxy/cleaning/api/v1/inspections" \
  -H "Authorization: Bearer $NEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-123",
    "propertyId": "prop-001",
    "score": 95,
    "notes": "Excellent condition",
    "photos": ["https://storage.example.com/photo1.jpg"]
  }'
```

### Get Performance Analytics
```bash
curl -X GET "https://api.adverant.ai/proxy/cleaning/api/v1/analytics?period=last_30_days" \
  -H "Authorization: Bearer $NEXUS_API_KEY"
```

---

## SDK Examples

### TypeScript

```typescript
import { NexusClient } from '@adverant/nexus-sdk';

const nexus = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY
});

const cleaning = nexus.plugin('nexus-cleaning');

// Generate optimized schedule
const schedule = await cleaning.schedules.optimize({
  date: '2025-01-02',
  propertyIds: ['prop-001', 'prop-002'],
  availableStaff: ['staff-001', 'staff-002'],
  optimizeFor: 'efficiency'
});

console.log(`Efficiency: ${schedule.efficiency * 100}%`);
console.log(`Estimated Cost: $${schedule.estimatedCost}`);

// Get tasks for a staff member
const tasks = await cleaning.tasks.list({
  staffId: 'staff-001',
  date: '2025-01-02'
});

tasks.forEach(task => {
  console.log(`${task.propertyId}: ${task.startTime} - ${task.status}`);
});
```

### Python

```python
from adverant_nexus import NexusClient
import os

nexus = NexusClient(api_key=os.environ["NEXUS_API_KEY"])
cleaning = nexus.plugin("nexus-cleaning")

# Generate optimized schedule
schedule = cleaning.schedules.optimize(
    date="2025-01-02",
    property_ids=["prop-001", "prop-002"],
    available_staff=["staff-001", "staff-002"],
    optimize_for="efficiency"
)

print(f"Efficiency: {schedule.efficiency * 100}%")
print(f"Estimated Cost: ${schedule.estimated_cost}")

# Create inspection report
inspection = cleaning.inspections.create(
    task_id="task-123",
    property_id="prop-001",
    score=95,
    notes="Excellent condition"
)

print(f"Inspection ID: {inspection.inspection_id}")
```

---

## Pricing

| Tier | Price | Properties | Staff | Features |
|------|-------|------------|-------|----------|
| **Starter** | $49/mo | 5 | 20 | Basic scheduling, Task management |
| **Professional** | $149/mo | 25 | 100 | AI optimization, Quality control, Analytics |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom integrations, Dedicated support |

---

## Next Steps

- [Use Cases Guide](./USE-CASES.md) - Real-world implementation scenarios
- [Architecture Overview](./ARCHITECTURE.md) - System design and integration
- [API Reference](./docs/api-reference/endpoints.md) - Complete endpoint documentation

## Support

- **Documentation**: [docs.adverant.ai/plugins/cleaning](https://docs.adverant.ai/plugins/cleaning)
- **Community**: [community.adverant.ai](https://community.adverant.ai)
- **Email**: plugins@adverant.ai
