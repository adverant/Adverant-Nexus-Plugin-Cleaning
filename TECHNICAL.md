# CleanPro - Technical Documentation

## API Reference

### Base URL

```
https://api.adverant.ai/proxy/nexus-cleaning/api/v1/cleaning
```

### Authentication

All API requests require a Bearer token in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

#### Required Scopes

| Scope | Description |
|-------|-------------|
| `cleaning:read` | Read schedules and tasks |
| `cleaning:write` | Create and modify tasks |
| `cleaning:staff` | Manage cleaner profiles |
| `cleaning:analytics` | Access performance analytics |

---

## API Endpoints

### Schedule Optimization

#### Optimize Cleaning Schedule

```http
POST /schedules/optimize
```

**Request Body:**

```json
{
  "date": "2025-02-01",
  "properties": ["prop_abc123", "prop_def456", "prop_ghi789"],
  "constraints": {
    "checkout_buffer_minutes": 60,
    "checkin_buffer_minutes": 120,
    "max_tasks_per_cleaner": 4,
    "prefer_same_zone": true
  },
  "optimization_goal": "minimize_travel | balance_workload | maximize_quality_time"
}
```

**Response:**

```json
{
  "schedule_id": "sched_abc123",
  "date": "2025-02-01",
  "status": "optimized",
  "assignments": [
    {
      "cleaner_id": "cleaner_xyz",
      "cleaner_name": "Maria Garcia",
      "tasks": [
        {
          "task_id": "task_001",
          "property_id": "prop_abc123",
          "property_name": "Beachfront Villa",
          "start_time": "11:00",
          "end_time": "13:00",
          "task_type": "turnover",
          "estimated_duration_minutes": 120,
          "travel_time_minutes": 15
        },
        {
          "task_id": "task_002",
          "property_id": "prop_def456",
          "property_name": "Downtown Loft",
          "start_time": "13:30",
          "end_time": "15:00",
          "task_type": "turnover",
          "estimated_duration_minutes": 90,
          "travel_time_minutes": 20
        }
      ],
      "total_tasks": 2,
      "total_work_hours": 3.5,
      "total_travel_minutes": 35
    }
  ],
  "optimization_metrics": {
    "total_travel_time_saved_minutes": 45,
    "workload_balance_score": 0.92,
    "all_constraints_satisfied": true
  }
}
```

### Task Management

#### List Cleaning Tasks

```http
GET /tasks
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | Filter by date (YYYY-MM-DD) |
| `property_id` | string | Filter by property |
| `cleaner_id` | string | Filter by assigned cleaner |
| `status` | string | Filter by status |
| `type` | string | Filter by task type |

**Response:**

```json
{
  "tasks": [
    {
      "task_id": "task_001",
      "property_id": "prop_abc123",
      "property_name": "Beachfront Villa",
      "type": "turnover",
      "status": "completed",
      "priority": "high",
      "scheduled_date": "2025-02-01",
      "scheduled_time": "11:00",
      "cleaner": {
        "cleaner_id": "cleaner_xyz",
        "name": "Maria Garcia"
      },
      "checkout_time": "10:00",
      "checkin_time": "15:00",
      "estimated_duration_minutes": 120,
      "actual_duration_minutes": 105,
      "checklist_completion": 100,
      "quality_score": 95,
      "photos_uploaded": 12,
      "issues_reported": 0
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Cleaning Task

```http
POST /tasks
```

**Request Body:**

```json
{
  "property_id": "prop_abc123",
  "type": "turnover | deep_clean | inspection | maintenance",
  "scheduled_date": "2025-02-01",
  "scheduled_time": "11:00",
  "priority": "high | medium | low",
  "cleaner_id": "cleaner_xyz",
  "notes": "Guest requested extra towels",
  "checklist_id": "checklist_standard",
  "special_instructions": [
    "Replace air freshener",
    "Check outdoor furniture"
  ]
}
```

**Response:**

```json
{
  "task_id": "task_001",
  "property_id": "prop_abc123",
  "type": "turnover",
  "status": "scheduled",
  "scheduled_date": "2025-02-01",
  "scheduled_time": "11:00",
  "cleaner": {
    "cleaner_id": "cleaner_xyz",
    "name": "Maria Garcia"
  },
  "estimated_duration_minutes": 120,
  "checklist_items": 45,
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### Update Task Status

```http
PATCH /tasks/:id/status
```

**Request Body:**

```json
{
  "status": "in_progress | completed | blocked | cancelled",
  "notes": "Started cleaning",
  "location": {
    "latitude": 25.7617,
    "longitude": -80.1918
  }
}
```

#### Upload Task Photos

```http
POST /tasks/:id/photos
```

**Request Body (multipart/form-data):**

| Field | Type | Description |
|-------|------|-------------|
| `photo` | file | Image file (JPEG, PNG) |
| `room` | string | Room identifier |
| `photo_type` | string | `before`, `after`, `issue` |
| `notes` | string | Optional description |

**Response:**

```json
{
  "photo_id": "photo_abc123",
  "task_id": "task_001",
  "room": "master_bedroom",
  "photo_type": "after",
  "url": "https://storage.adverant.ai/cleaning/photo_abc123.jpg",
  "thumbnail_url": "https://storage.adverant.ai/cleaning/photo_abc123_thumb.jpg",
  "uploaded_at": "2025-02-01T12:30:00Z"
}
```

### Cleaner Management

#### Register a Cleaner

```http
POST /cleaners
```

**Request Body:**

```json
{
  "name": "Maria Garcia",
  "email": "maria@example.com",
  "phone": "+1-555-0123",
  "skills": ["deep_clean", "laundry", "staging", "pet_friendly"],
  "zones": ["downtown", "beachfront", "suburbs"],
  "certifications": ["eco_certified", "covid_safety"],
  "availability": {
    "monday": { "start": "08:00", "end": "18:00" },
    "tuesday": { "start": "08:00", "end": "18:00" },
    "wednesday": { "start": "08:00", "end": "18:00" },
    "thursday": { "start": "08:00", "end": "18:00" },
    "friday": { "start": "08:00", "end": "18:00" }
  },
  "hourly_rate": 25.00,
  "max_daily_tasks": 4
}
```

**Response:**

```json
{
  "cleaner_id": "cleaner_xyz",
  "name": "Maria Garcia",
  "status": "active",
  "skills": ["deep_clean", "laundry", "staging", "pet_friendly"],
  "zones": ["downtown", "beachfront", "suburbs"],
  "performance": {
    "tasks_completed": 0,
    "average_quality_score": null,
    "on_time_percentage": null
  },
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### List Cleaners

```http
GET /cleaners
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `zone` | string | Filter by zone |
| `skill` | string | Filter by skill |
| `available_date` | string | Check availability for date |
| `status` | string | `active`, `inactive`, `on_leave` |

### Inspections

#### Create Inspection Report

```http
POST /inspections
```

**Request Body:**

```json
{
  "task_id": "task_001",
  "property_id": "prop_abc123",
  "inspector_id": "user_abc",
  "inspection_type": "post_cleaning | pre_guest | damage_assessment",
  "rooms": [
    {
      "room": "living_room",
      "checklist_items": [
        { "item": "floors_cleaned", "passed": true },
        { "item": "surfaces_dusted", "passed": true },
        { "item": "windows_clean", "passed": false, "notes": "Streak marks on window" }
      ],
      "photos": ["photo_001", "photo_002"],
      "score": 90
    },
    {
      "room": "kitchen",
      "checklist_items": [
        { "item": "appliances_clean", "passed": true },
        { "item": "counters_sanitized", "passed": true },
        { "item": "trash_emptied", "passed": true }
      ],
      "photos": ["photo_003"],
      "score": 100
    }
  ],
  "issues": [
    {
      "type": "cleaning_deficiency",
      "severity": "minor",
      "room": "living_room",
      "description": "Window has streak marks",
      "requires_reclean": false
    }
  ],
  "overall_score": 95,
  "guest_ready": true
}
```

### Analytics

#### Get Performance Analytics

```http
GET /analytics
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | string | Start of date range |
| `end_date` | string | End of date range |
| `property_id` | string | Filter by property |
| `cleaner_id` | string | Filter by cleaner |
| `group_by` | string | `day`, `week`, `month`, `cleaner`, `property` |

**Response:**

```json
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "summary": {
    "total_tasks": 245,
    "completed_tasks": 240,
    "completion_rate": 98.0,
    "average_quality_score": 94.5,
    "on_time_rate": 96.0,
    "issues_reported": 12,
    "issues_resolved": 11
  },
  "by_cleaner": [
    {
      "cleaner_id": "cleaner_xyz",
      "name": "Maria Garcia",
      "tasks_completed": 48,
      "average_quality_score": 96.5,
      "on_time_rate": 98.0,
      "average_duration_minutes": 105,
      "total_hours_worked": 84
    }
  ],
  "by_property": [
    {
      "property_id": "prop_abc123",
      "name": "Beachfront Villa",
      "tasks_completed": 15,
      "average_quality_score": 95.0,
      "average_duration_minutes": 120,
      "issues_count": 2
    }
  ],
  "trends": {
    "quality_trend": "improving",
    "efficiency_trend": "stable"
  }
}
```

---

## Rate Limits

| Tier | Tasks/min | Schedules/min | Analytics/min |
|------|-----------|---------------|---------------|
| Starter | 30 | 5 | 10 |
| Professional | 100 | 20 | 50 |
| Enterprise | 500 | 100 | Unlimited |

---

## Data Models

### Task

```typescript
interface CleaningTask {
  task_id: string;
  property_id: string;
  property_name: string;
  type: 'turnover' | 'deep_clean' | 'inspection' | 'maintenance' | 'touch_up';
  status: 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  scheduled_date: string;
  scheduled_time: string;
  cleaner?: CleanerReference;
  checkout_time?: string;
  checkin_time?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  checklist_id: string;
  checklist_completion: number;
  quality_score?: number;
  photos: Photo[];
  issues: Issue[];
  notes?: string;
  special_instructions?: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface CleanerReference {
  cleaner_id: string;
  name: string;
  phone?: string;
}
```

### Cleaner

```typescript
interface Cleaner {
  cleaner_id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_leave';
  skills: string[];
  zones: string[];
  certifications: string[];
  availability: WeeklyAvailability;
  hourly_rate: number;
  max_daily_tasks: number;
  performance: CleanerPerformance;
  created_at: string;
  updated_at: string;
}

interface CleanerPerformance {
  tasks_completed: number;
  average_quality_score: number;
  on_time_percentage: number;
  average_duration_variance: number;
  issues_reported: number;
  positive_reviews: number;
}

interface WeeklyAvailability {
  [day: string]: {
    start: string;
    end: string;
  } | null;
}
```

### Inspection

```typescript
interface Inspection {
  inspection_id: string;
  task_id: string;
  property_id: string;
  inspector_id: string;
  inspection_type: 'post_cleaning' | 'pre_guest' | 'damage_assessment';
  rooms: RoomInspection[];
  issues: Issue[];
  overall_score: number;
  guest_ready: boolean;
  created_at: string;
}

interface RoomInspection {
  room: string;
  checklist_items: ChecklistItem[];
  photos: string[];
  score: number;
  notes?: string;
}

interface ChecklistItem {
  item: string;
  passed: boolean;
  notes?: string;
}

interface Issue {
  type: 'cleaning_deficiency' | 'damage' | 'maintenance_needed' | 'supply_shortage';
  severity: 'critical' | 'major' | 'minor';
  room: string;
  description: string;
  photo_id?: string;
  requires_reclean: boolean;
  resolved: boolean;
  resolved_at?: string;
}
```

---

## SDK Integration

### JavaScript/TypeScript

```typescript
import { NexusClient } from '@adverant/nexus-sdk';

const client = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY
});

// Optimize schedule for a date
const schedule = await client.cleaning.schedules.optimize({
  date: '2025-02-01',
  properties: ['prop_abc123', 'prop_def456'],
  optimization_goal: 'minimize_travel'
});

console.log(`Saved ${schedule.optimization_metrics.total_travel_time_saved_minutes} minutes of travel`);

// Create a cleaning task
const task = await client.cleaning.tasks.create({
  property_id: 'prop_abc123',
  type: 'turnover',
  scheduled_date: '2025-02-01',
  scheduled_time: '11:00',
  priority: 'high'
});

// Upload task photos
await client.cleaning.tasks.uploadPhoto(task.task_id, {
  photo: photoFile,
  room: 'living_room',
  photo_type: 'after'
});

// Get analytics
const analytics = await client.cleaning.analytics({
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  group_by: 'cleaner'
});
```

### Python

```python
from nexus_sdk import NexusClient

client = NexusClient(api_key=os.environ["NEXUS_API_KEY"])

# Register a cleaner
cleaner = client.cleaning.cleaners.create(
    name="Maria Garcia",
    email="maria@example.com",
    phone="+1-555-0123",
    skills=["deep_clean", "laundry", "staging"],
    zones=["downtown", "beachfront"]
)

# Create cleaning task
task = client.cleaning.tasks.create(
    property_id="prop_abc123",
    type="turnover",
    scheduled_date="2025-02-01",
    scheduled_time="11:00",
    cleaner_id=cleaner["cleaner_id"],
    priority="high"
)

# Create inspection report
inspection = client.cleaning.inspections.create(
    task_id=task["task_id"],
    property_id="prop_abc123",
    inspection_type="post_cleaning",
    rooms=[
        {
            "room": "living_room",
            "checklist_items": [
                {"item": "floors_cleaned", "passed": True},
                {"item": "surfaces_dusted", "passed": True}
            ],
            "score": 100
        }
    ],
    overall_score=95,
    guest_ready=True
)
```

---

## Webhook Events

| Event | Description |
|-------|-------------|
| `task.created` | New cleaning task created |
| `task.assigned` | Task assigned to cleaner |
| `task.started` | Cleaner started task |
| `task.completed` | Task completed |
| `task.blocked` | Task blocked by issue |
| `inspection.completed` | Inspection finished |
| `inspection.failed` | Property not guest ready |
| `issue.reported` | Issue reported during task |
| `schedule.optimized` | Schedule optimization complete |

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `TASK_NOT_FOUND` | 404 | Task does not exist |
| `CLEANER_NOT_FOUND` | 404 | Cleaner does not exist |
| `CLEANER_UNAVAILABLE` | 400 | Cleaner not available for date/time |
| `SCHEDULE_CONFLICT` | 400 | Scheduling conflict detected |
| `PROPERTY_LIMIT_EXCEEDED` | 402 | Property limit for tier exceeded |
| `PHOTO_UPLOAD_FAILED` | 400 | Photo upload error |
| `OPTIMIZATION_FAILED` | 500 | Schedule optimization error |

---

## Deployment Requirements

### Container Specifications

| Resource | Value |
|----------|-------|
| CPU | 500m (0.5 core) |
| Memory | 1024 MB |
| Disk | 5 GB |
| Timeout | 120,000 ms (2 min) |
| Max Concurrent Jobs | 20 |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis for caching |
| `MAGEAGENT_URL` | Yes | MageAgent service URL |
| `STORAGE_BUCKET` | Yes | Cloud storage for photos |
| `GOOGLE_MAPS_API_KEY` | Yes | For route optimization |

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/health` | General health check |
| `/ready` | Readiness probe |
| `/live` | Liveness probe |

---

## Quotas and Limits

### By Pricing Tier

| Limit | Starter | Professional | Enterprise |
|-------|---------|--------------|------------|
| Properties | 5 | 25 | Unlimited |
| Staff Members | 20 | 100 | Unlimited |
| Tasks/month | 100 | 500 | Unlimited |
| Photo Storage | 1 GB | 10 GB | Unlimited |
| AI Optimization | - | Yes | Yes |
| Quality Control | Basic | Advanced | Advanced |
| Analytics | Basic | Full | Full |

### Pricing

| Tier | Monthly |
|------|---------|
| Starter | $49 |
| Professional | $149 |
| Enterprise | Custom |

---

## Support

- **Documentation**: [docs.adverant.ai/plugins/cleaning](https://docs.adverant.ai/plugins/cleaning)
- **Discord**: [discord.gg/adverant](https://discord.gg/adverant)
- **Email**: support@adverant.ai
