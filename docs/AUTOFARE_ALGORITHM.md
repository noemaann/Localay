# AutoFare Comparison Algorithm & Data Methodology

This document details the comparison logic, statistical calculations, assumptions, and limitations of the **AutoFare** community auto-rickshaw fare feature in **LOCALAY**.

---

## 1. Goal & Principles

AutoFare provides a responsible, transparent, community-reported auto-rickshaw fare comparison tool for locals and travelers.

### Key Principles
1. **Preserve Individual Historical Records**: Every user submission is saved as an individual document in the `fareReports` collection. Submitting a new report **never overwrites past entries**.
2. **Neutral Outcome Labels**: The system never accuses auto drivers of overcharging or scamming. Outcomes are stated neutrally:
   - `Within reported range`
   - `Below reported range`
   - `Above reported range`
   - `Insufficient comparable data`
3. **Transparent Methodology**: Algorithm criteria, sample size, recency windows, and statistical limits are explicitly displayed to the user.
4. **No Unvalidated API Claims**: LOCALAY explicitly disclaims access to live government tariff meters or private ride-hailing APIs. All stats are derived strictly from community-contributed data.

---

## 2. Collected Data Fields

| Field | Type | Validation & Description |
|---|---|---|
| `origin` | String | Required. Pickup stand or landmark. |
| `destination` | String | Required. Drop-off location. |
| `regionId` | String | Required. Region reference (e.g. `malappuram-kerala`). |
| `districtId` | String | District identifier (e.g. `malappuram`). |
| `townId` | String | Town / Locality identifier (e.g. `kottakkal-town`). |
| `distanceKm` | Number | Required. Positive number (> 0, max 500 km). |
| `fareAmount` | Number | Required. Total base fare in INR (> 0, max 50,000 INR). |
| `fareType` | String | `metered` (by meter) or `agreed` (negotiated rate). |
| `tripType` | String | `one_way` or `round_trip`. |
| `timeOfDay` | String | `day` (6 AM - 9 PM), `night` (9 PM - 6 AM), or `peak`. |
| `waitingMinutes` | Number | Optional waiting time in minutes (>= 0). |
| `waitingCharges` | Number | Optional waiting charges in INR (>= 0). |
| `tollsAndExtras` | Number | Optional tolls or baggage surcharges in INR (>= 0). |
| `notes` | String | Optional context (e.g., heavy rain, multi-passenger). |

*Note: No sensitive personal contact information or exact home addresses are collected.*

---

## 3. Comparison Logic & Algorithm Steps

The pure calculation function `calculateFareSummary(reports, criteria)` executes in five stages:

```
Candidate Fare Reports
          │
          ▼
   1. Recency Filter (Age <= 180 days)
          │
          ▼
   2. Route & Distance Match Filter (±1.5 km or ±25%)
          │
          ▼
   3. Effective Fare Computation (Base + Extras + Waiting)
          │
          ▼
   4. Sample Size Threshold Check (Sample Size >= 2)
          │
      ┌───┴────────────────────────┐
      ▼                            ▼
  Sample < 2                  Sample >= 2
┌───────────┐           ┌────────────────────────────┐
│Insufficient│          │ Calculate Stats:           │
│Data Status│           │ Min, Max, Mean, Median,    │
└───────────┘           │ 25th & 75th Percentiles.   │
                        │ Compare Quoted Fare.       │
                        └────────────────────────────┘
```

### Stage 1: Recency Filter
Reports older than `maxAgeDays` (default **180 days**) are excluded to ensure statistics reflect current economic conditions and fuel prices.

### Stage 2: Route & Distance Matching
A report is considered comparable if:
1. Origin and destination string match (direct or reverse direction).
2. OR distance is within tolerance: `Math.abs(report.distanceKm - criteria.distanceKm) <= Math.max(1.5, criteria.distanceKm * 0.25)`.
3. If specified in criteria, `tripType` and `timeOfDay` must also align.

### Stage 3: Total Effective Fare Calculation
For each comparable report, total effective fare is calculated as:
$$\text{Effective Fare} = \text{fareAmount} + \text{waitingCharges} + \text{tollsAndExtras}$$

### Stage 4: Minimum Sample Size Check
If the number of matching reports is **fewer than 2**, the algorithm halts and returns:
- `status: "insufficient_data"`
- `comparisonOutcome: "Insufficient comparable data"`
- Transparent message explaining that multiple independent reports are required.

### Stage 5: Statistical Calculations & Neutral Outcome
When sample size $\ge 2$:
- **Descriptive Statistics**:
  - `minFare`: Smallest effective fare
  - `maxFare`: Largest effective fare
  - `meanFare`: Arithmetic mean rounded to nearest integer
  - `medianFare`: 50th percentile
  - `p25Fare`: 25th percentile
  - `p75Fare`: 75th percentile
- **Outcome Evaluation** against `queryFareAmount`:
  - `queryFareAmount < minFare` $\rightarrow$ **Below reported range**
  - `queryFareAmount > maxFare` $\rightarrow$ **Above reported range**
  - `minFare <= queryFareAmount <= maxFare` $\rightarrow$ **Within reported range**

---

## 4. Limitations & Assumptions

1. **Community Scope**: Statistics reflect community-contributed entries and do not represent government-mandated fare tariffs.
2. **Dynamic Factors**: Real-world fares fluctuate based on weather, monsoon flooding, steep hill terrain, waiting time in heavy traffic, and night-time surcharges.
3. **No Driver Blame**: Output ranges provide realistic reference expectations without declaring drivers as fraudulent.
