
<h1 align="center">Cleaning</h1>

<p align="center">
  <strong>Intelligent Cleaning Coordination</strong>
</p>

<p align="center">
  <a href="https://github.com/adverant/Adverant-Nexus-Plugin-Cleaning/actions"><img src="https://github.com/adverant/Adverant-Nexus-Plugin-Cleaning/workflows/CI/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/adverant/Adverant-Nexus-Plugin-Cleaning/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://marketplace.adverant.ai/plugins/cleaning"><img src="https://img.shields.io/badge/Nexus-Marketplace-purple.svg" alt="Nexus Marketplace"></a>
  <a href="https://discord.gg/adverant"><img src="https://img.shields.io/badge/Discord-Community-7289da.svg" alt="Discord"></a>
</p>

<p align="center">
  <a href="#features">Features</a> -
  <a href="#quick-start">Quick Start</a> -
  <a href="#use-cases">Use Cases</a> -
  <a href="#pricing">Pricing</a> -
  <a href="#documentation">Documentation</a>
</p>

---

## Perfect Turnovers, Every Time

**Cleaning** is a Nexus Marketplace plugin that automates the entire cleaning coordination process for short-term rentals. From intelligent scheduling to quality tracking and team management, ensure every property is guest-ready without the operational headaches.

### Why Cleaning?

- **Smart Scheduling**: AI-optimized cleaning schedules based on checkout times and property locations
- **Real-time Coordination**: Instant notifications to cleaning teams with all property details
- **Quality Tracking**: Photo documentation and checklist completion for every turnover
- **Team Management**: Cleaner performance metrics, availability tracking, and payroll integration
- **Guest-Ready Verification**: Automated confirmation before guest arrival

---

## Features

### Intelligent Scheduling

| Feature | Description |
|---------|-------------|
| **Auto-Scheduling** | Automatically creates cleaning tasks when reservations are booked |
| **Route Optimization** | Groups nearby properties for efficient cleaner routing |
| **Time Estimation** | AI predicts cleaning duration based on property size |
| **Conflict Detection** | Alerts for overlapping cleanings or tight turnaround windows |

### Team Management

| Feature | Description |
|---------|-------------|
| **Cleaner Profiles** | Skills, certifications, availability, and performance metrics |
| **Availability Tracking** | Real-time visibility into cleaner schedules and capacity |
| **Automatic Assignment** | Smart matching based on proximity, skills, and workload |
| **Mobile App** | iOS and Android apps for cleaners with offline support |

### Quality Assurance

| Feature | Description |
|---------|-------------|
| **Digital Checklists** | Customizable room-by-room cleaning checklists |
| **Photo Documentation** | Before/after photos for every cleaning |
| **Quality Scores** | Automated scoring based on checklist completion and time |
| **Issue Reporting** | Instant damage and maintenance issue flagging |

---

## Quick Start

### Installation

```bash
nexus plugin install nexus-cleaning
```

### Register a Cleaner

```bash
curl -X POST "https://api.adverant.ai/proxy/nexus-cleaning/api/v1/cleaners" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Garcia",
    "email": "maria@example.com",
    "phone": "+1-555-0123",
    "skills": ["deep_clean", "laundry", "staging"],
    "zones": ["downtown", "beachfront"]
  }'
```

### Create a Cleaning Task

```bash
curl -X POST "https://api.adverant.ai/proxy/nexus-cleaning/api/v1/tasks" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_abc123",
    "type": "turnover",
    "scheduledDate": "2025-02-01",
    "scheduledTime": "11:00",
    "priority": "high"
  }'
```

---

## Use Cases

### Vacation Rental Operators

#### 1. Same-Day Turnovers
Handle back-to-back bookings with confidence. AI scheduling ensures cleaners arrive right after checkout with enough time before check-in.

#### 2. Quality Consistency
Every property cleaned to the same standard, every time. Digital checklists and photo documentation ensure nothing is missed.

### Cleaning Companies

#### 3. Workforce Optimization
Route optimization and smart scheduling help cleaners complete more turnovers per day with less travel time.

---

## Pricing

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| **Price** | $39/mo | $99/mo | $299/mo |
| **Properties** | Up to 15 | Up to 75 | Unlimited |
| **Cleaners** | 3 | 15 | Unlimited |
| **Tasks/month** | 100 | 500 | Unlimited |
| **Photo Storage** | 1 GB | 10 GB | Unlimited |

[View on Nexus Marketplace](https://marketplace.adverant.ai/plugins/cleaning)

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cleaners` | Register a cleaner |
| `GET` | `/cleaners` | List all cleaners |
| `POST` | `/tasks` | Create cleaning task |
| `GET` | `/tasks` | List cleaning tasks |
| `PATCH` | `/tasks/:id/status` | Update task status |
| `POST` | `/tasks/:id/photos` | Upload task photos |

Full API documentation: [docs/api-reference/endpoints.md](docs/api-reference/endpoints.md)

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/adverant/Adverant-Nexus-Plugin-Cleaning.git
cd Adverant-Nexus-Plugin-Cleaning
npm install
npm run prisma:generate
npm run dev
```

---

## Community & Support

- **Documentation**: [docs.adverant.ai/plugins/cleaning](https://docs.adverant.ai/plugins/cleaning)
- **Discord**: [discord.gg/adverant](https://discord.gg/adverant)
- **Email**: support@adverant.ai

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with care by <a href="https://adverant.ai">Adverant</a></strong>
</p>
