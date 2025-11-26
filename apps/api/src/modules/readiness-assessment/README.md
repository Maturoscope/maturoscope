# Readiness Assessment Module

This module provides a comprehensive system to evaluate the readiness level of users across three key dimensions:
- **TRL** (Technology Readiness Level) - 7 questions
- **MkRL** (Market Readiness Level) - 4 questions  
- **MfRL** (Manufacturing Readiness Level) - 4 questions

## Core Concepts

### Readiness Level Calculation
The readiness level for each scale is determined by the **lowest value** selected by the user across all questions in that scale.

### Development Phases
Each readiness level (1-9) maps to a development phase (1-4):
- **Phase 1** (Levels 1-3): Conceptualization & Research
- **Phase 2** (Levels 4-6): Prototype & Demonstration
- **Phase 3** (Levels 7-8): System Demonstration & Validation
- **Phase 4** (Level 9): Full Deployment & Scaling

### Risk Analysis
When development phases differ across scales, the system identifies associated risks and provides strategic recommendations.

## API Endpoints

### 1. Get All Questions
```
GET /readiness-assessment/questions
```

Returns all questions for TRL, MkRL, and MfRL scales with their available levels.

**Response:**
```json
{
  "TRL": {
    "name": "Technology Readiness Level",
    "abbreviation": "TRL",
    "questions": [
      {
        "id": "TRL_Q1",
        "code": "A2",
        "text": "Is the technical concept formulated...",
        "levels": {
          "1": "The concept is only described informally.",
          "2": "A brief formalization is available...",
          ...
        }
      },
      ...
    ]
  },
  "MkRL": { ... },
  "MfRL": { ... }
}
```

### 2. Get Questions by Scale
```
GET /readiness-assessment/questions/:scale
```

**Parameters:**
- `scale`: TRL, MkRL, or MfRL

**Response:**
```json
{
  "name": "Technology Readiness Level",
  "abbreviation": "TRL",
  "questions": [...]
}
```

### 3. Assess a Single Scale
```
POST /readiness-assessment/assess
```

Evaluates answers for one scale and returns the readiness level, development phase, and identified gaps.

**Request Body:**
```json
{
  "scale": "TRL",
  "answers": {
    "TRL_Q1": "3",
    "TRL_Q2": "5",
    "TRL_Q3": "4",
    "TRL_Q4": "2",
    "TRL_Q5": "3",
    "TRL_Q6": "4",
    "TRL_Q7": "3"
  }
}
```

**Response:**
```json
{
  "scale": "TRL",
  "readinessLevel": 2,
  "lowestLevels": [
    {
      "questionId": "TRL_Q4",
      "questionText": "Have you carried out laboratory...",
      "selectedLevel": "2"
    }
  ],
  "developmentPhase": {
    "phase": 1,
    "phaseName": "Phase 1: Conceptualization & Research",
    "focusGoal": "Basic Feasibility & Hypothesis Validation",
    "scaleRange": "1-3"
  },
  "gaps": [
    {
      "questionId": "TRL_Q2",
      "gapDescription": "3D views or simplified digital models..."
    }
  ]
}
```

### 4. Analyze Risk Across All Scales
```
POST /readiness-assessment/analyze-risk
```

Analyzes the readiness levels across all three scales to identify risks when phases differ.

**Request Body:**
```json
{
  "scales": [
    {
      "scale": "TRL",
      "readinessLevel": 2,
      "phase": 1
    },
    {
      "scale": "MkRL",
      "readinessLevel": 4,
      "phase": 2
    },
    {
      "scale": "MfRL",
      "readinessLevel": 3,
      "phase": 1
    }
  ]
}
```

**Response:**
```json
{
  "overallPhase": 1,
  "phasesMatch": false,
  "risks": [
    {
      "scale": "TRL",
      "readinessLevel": 2,
      "phase": 1,
      "isLowest": true,
      "strategicFocus": "Maturation & Demonstration",
      "primaryRisk": "Technical Failure / Inoperability"
    },
    {
      "scale": "MkRL",
      "readinessLevel": 4,
      "phase": 2,
      "isLowest": false
    },
    {
      "scale": "MfRL",
      "readinessLevel": 3,
      "phase": 1,
      "isLowest": false
    }
  ],
  "recommendations": [
    "To progress to the next development phase, focus on TRL scale and mitigate the following risks:",
    "- Strategic Focus: Maturation & Demonstration",
    "- Primary Risk: Technical Failure / Inoperability"
  ]
}
```

## Workflow Example

### Typical User Flow:

1. **Get Questions** - Frontend fetches all questions:
```javascript
const questions = await fetch('/readiness-assessment/questions').then(r => r.json());
```

2. **User Completes Assessment** - User answers questions for each scale

3. **Assess Each Scale** - Submit answers for each scale individually:
```javascript
// Assess TRL
const trlResult = await fetch('/readiness-assessment/assess', {
  method: 'POST',
  body: JSON.stringify({
    scale: 'TRL',
    answers: { /* user answers */ }
  })
}).then(r => r.json());

// Repeat for MkRL and MfRL
```

4. **Analyze Overall Risk** - Submit all three results for risk analysis:
```javascript
const riskAnalysis = await fetch('/readiness-assessment/analyze-risk', {
  method: 'POST',
  body: JSON.stringify({
    scales: [
      { scale: 'TRL', readinessLevel: trlResult.readinessLevel, phase: trlResult.developmentPhase.phase },
      { scale: 'MkRL', readinessLevel: mkrlResult.readinessLevel, phase: mkrlResult.developmentPhase.phase },
      { scale: 'MfRL', readinessLevel: mfrlResult.readinessLevel, phase: mfrlResult.developmentPhase.phase }
    ]
  })
}).then(r => r.json());
```

## Data Structure

The assessment data is stored in `data/assessment-data.json` and can be easily modified to:
- Add/remove questions
- Change level descriptions
- Update gap descriptions
- Modify risk mitigation strategies

### JSON Structure:
```json
{
  "scales": {
    "TRL": { "questions": [...] },
    "MkRL": { "questions": [...] },
    "MfRL": { "questions": [...] }
  },
  "readinessLevelMapping": { ... },
  "riskMitigation": { ... },
  "gaps": {
    "A2": {
      "1": "Gap description for question A2 at level 1",
      "2": "Gap description for question A2 at level 2",
      ...
      "9": "Gap description for question A2 at level 9"
    },
    "B2": { ... },
    ...
  }
}
```

**Note**: Gaps are structured by question code (A2, B2, C5, etc.) and level (1-9), allowing precise gap identification for each question-level combination.

## Extensibility

The module is designed to be flexible:
- Questions can be added/removed by editing the JSON file
- New scales can be added by extending the JSON structure
- Gap logic can be customized in the service
- Risk analysis rules can be modified

## Error Handling

The module includes validation for:
- Invalid scale types
- Missing question answers
- Missing scale assessments in risk analysis
- Invalid readiness levels

All errors return appropriate HTTP status codes and descriptive messages.

