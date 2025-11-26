# Customization Guide

This guide explains how to customize and extend the Readiness Assessment system.

## Adding a New Question

To add a new question to any scale, edit `data/assessment-data.json`:

### Example: Adding a new TRL question

```json
{
  "scales": {
    "TRL": {
      "questions": [
        // ... existing questions ...
        {
          "id": "TRL_Q8",
          "code": "H3",
          "text": "Have you validated your solution with end users?",
          "levels": {
            "1": "No user validation has been performed.",
            "2": "Initial user interviews conducted.",
            "3": "User feedback collected from mockups.",
            "4": "Users tested prototype in controlled environment.",
            "5": "User testing in realistic scenarios.",
            "6": "Beta testing with selected users.",
            "7": "Pilot deployment with real users.",
            "8": "Full deployment with user monitoring.",
            "9": "Continuous user feedback loop established."
          }
        }
      ]
    }
  }
}
```

**No code changes required** - the system will automatically include the new question!

## Removing a Question

Simply delete the question object from the `questions` array in `data/assessment-data.json`.

## Modifying Question Text or Levels

Edit the `text` or `levels` fields directly in the JSON file:

```json
{
  "id": "TRL_Q1",
  "code": "A2",
  "text": "Updated question text here...",
  "levels": {
    "1": "Updated level 1 description...",
    "2": "Updated level 2 description...",
    // ...
  }
}
```

## Adding a New Scale

To add a completely new scale (e.g., "SRL" - Sustainability Readiness Level):

### 1. Add the scale to the JSON data:

```json
{
  "scales": {
    "TRL": { ... },
    "MkRL": { ... },
    "MfRL": { ... },
    "SRL": {
      "name": "Sustainability Readiness Level",
      "abbreviation": "SRL",
      "questions": [
        {
          "id": "SRL_Q1",
          "code": "S1",
          "text": "Have you assessed environmental impact?",
          "levels": {
            "1": "No assessment done.",
            "2": "Initial research conducted.",
            // ... levels 3-9
          }
        }
        // ... more questions
      ]
    }
  },
  "gaps": {
    "TRL": { ... },
    "MkRL": { ... },
    "MfRL": { ... },
    "SRL": {
      "2_TO_3": {
        "S1": "Environmental impact has not been fully assessed."
      }
    }
  },
  "riskMitigation": {
    "TRL_LOWEST": { ... },
    "MkRL_LOWEST": { ... },
    "MfRL_LOWEST": { ... },
    "SRL_LOWEST": {
      "strategicFocus": "Sustainability & Environmental Impact",
      "primaryRisk": "Regulatory Non-compliance / Environmental Impact"
    }
  }
}
```

### 2. Update the DTOs:

Edit `dto/scale-assessment.dto.ts`:

```typescript
export enum ScaleType {
  TRL = 'TRL',
  MkRL = 'MkRL',
  MfRL = 'MfRL',
  SRL = 'SRL',  // Add new scale
}
```

Edit `dto/questions.dto.ts`:

```typescript
export class AllQuestionsDto {
  TRL: ScaleQuestionsDto;
  MkRL: ScaleQuestionsDto;
  MfRL: ScaleQuestionsDto;
  SRL: ScaleQuestionsDto;  // Add new scale
}
```

### 3. Update the service:

Edit `readiness-assessment.service.ts`:

```typescript
getAllQuestions(): AllQuestionsDto {
  const { scales } = this.assessmentData;
  return {
    TRL: {
      name: scales.TRL.name,
      abbreviation: scales.TRL.abbreviation,
      questions: scales.TRL.questions,
    },
    MkRL: { ... },
    MfRL: { ... },
    SRL: {  // Add new scale
      name: scales.SRL.name,
      abbreviation: scales.SRL.abbreviation,
      questions: scales.SRL.questions,
    },
  };
}
```

And update the risk analysis to handle 4 scales instead of 3:

```typescript
analyzeRisk(riskAnalysisDto: RiskAnalysisDto): RiskAnalysisResultDto {
  const { scales } = riskAnalysisDto;

  // Update to include SRL
  const requiredScales = [ScaleType.TRL, ScaleType.MkRL, ScaleType.MfRL, ScaleType.SRL];
  
  // ... rest of the logic remains the same
}
```

## Modifying Gap Descriptions

Gaps are structured by question code and level, making it easy to modify individual gap descriptions:

### Current Structure:

```json
{
  "gaps": {
    "A2": {
      "1": "Gap description for question A2 at level 1",
      "2": "Gap description for question A2 at level 2",
      ...
      "9": "Gap description for question A2 at level 9"
    },
    "B2": {
      "1": "Gap description for question B2 at level 1",
      ...
    }
  }
}
```

### To modify a gap:

Simply edit the corresponding `gaps[questionId][level]` entry in `data/assessment-data.json`:

```json
{
  "gaps": {
    "TRL_Q1": {
      "2": "Updated gap description for TRL_Q1 level 2",
      ...
    }
  }
}
```

**No code changes required!** The service automatically looks up gaps using the question code and selected level.

## Customizing Risk Analysis

To add custom risk analysis rules, edit the `analyzeRisk` method in `readiness-assessment.service.ts`:

### Example: Add severity levels

```typescript
analyzeRisk(riskAnalysisDto: RiskAnalysisDto): RiskAnalysisResultDto {
  // ... existing code ...

  // Calculate phase difference to determine severity
  const maxPhase = Math.max(...phases);
  const phaseDifference = maxPhase - lowestPhase;

  let severity: 'low' | 'medium' | 'high' = 'low';
  if (phaseDifference >= 2) {
    severity = 'high';
  } else if (phaseDifference === 1) {
    severity = 'medium';
  }

  return {
    overallPhase: lowestPhase,
    phasesMatch,
    severity,  // Add severity to response
    risks,
    recommendations,
  };
}
```

Remember to update the DTO:

```typescript
export class RiskAnalysisResultDto {
  overallPhase: number;
  phasesMatch: boolean;
  severity?: 'low' | 'medium' | 'high';  // Add this
  risks: Array<{...}>;
  recommendations: string[];
}
```

## Changing Development Phase Mapping

To modify how readiness levels map to phases, edit the `readinessLevelMapping` in `data/assessment-data.json`:

```json
{
  "readinessLevelMapping": {
    "1": {
      "phase": 1,
      "phaseName": "Your Custom Phase Name",
      "focusGoal": "Your Custom Focus",
      "scaleRange": "1"
    },
    // ... customize all 9 levels
  }
}
```

## Internationalization (i18n)

To support multiple languages:

### Option 1: Multiple JSON files

Create separate files for each language:
- `data/assessment-data.en.json`
- `data/assessment-data.es.json`
- `data/assessment-data.fr.json`

Modify the service to load based on language:

```typescript
constructor() {
  this.loadAssessmentData('en');  // default language
}

private loadAssessmentData(language: string = 'en') {
  const dataPath = path.join(
    __dirname,
    'data',
    `assessment-data.${language}.json`,
  );
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  this.assessmentData = JSON.parse(rawData);
}

// Add method to change language
setLanguage(language: string) {
  this.loadAssessmentData(language);
}
```

### Option 2: Nested language structure

```json
{
  "scales": {
    "TRL": {
      "name": {
        "en": "Technology Readiness Level",
        "es": "Nivel de Madurez Tecnológica",
        "fr": "Niveau de Maturité Technologique"
      },
      "questions": [
        {
          "id": "TRL_Q1",
          "code": "A2",
          "text": {
            "en": "Is the technical concept formulated...",
            "es": "¿Está formulado el concepto técnico...",
            "fr": "Le concept technique est-il formulé..."
          },
          "levels": {
            "1": {
              "en": "The concept is only described informally.",
              "es": "El concepto solo se describe informalmente.",
              "fr": "Le concept n'est décrit que de manière informelle."
            }
          }
        }
      ]
    }
  }
}
```

## Performance Optimization

### Caching Assessment Data

If the JSON file is large, you can implement caching:

```typescript
@Injectable()
export class ReadinessAssessmentService {
  private static cachedData: AssessmentData | null = null;
  private static lastLoadTime: number = 0;
  private static CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.loadAssessmentData();
  }

  private loadAssessmentData() {
    const now = Date.now();
    
    if (
      ReadinessAssessmentService.cachedData &&
      now - ReadinessAssessmentService.lastLoadTime < ReadinessAssessmentService.CACHE_DURATION
    ) {
      this.assessmentData = ReadinessAssessmentService.cachedData;
      return;
    }

    const dataPath = path.join(__dirname, 'data', 'assessment-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.assessmentData = JSON.parse(rawData);
    
    ReadinessAssessmentService.cachedData = this.assessmentData;
    ReadinessAssessmentService.lastLoadTime = now;
  }
}
```

## Adding Persistence (Database)

To store user assessments in the database:

### 1. Create entities:

```typescript
// entities/user-assessment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('user_assessments')
export class UserAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  scale: string;

  @Column('jsonb')
  answers: Record<string, string>;

  @Column()
  readinessLevel: number;

  @Column()
  phase: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 2. Update module:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAssessment } from './entities/user-assessment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAssessment])],
  controllers: [ReadinessAssessmentController],
  providers: [ReadinessAssessmentService],
  exports: [ReadinessAssessmentService],
})
export class ReadinessAssessmentModule {}
```

### 3. Add save method to service:

```typescript
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReadinessAssessmentService {
  constructor(
    @InjectRepository(UserAssessment)
    private userAssessmentRepository: Repository<UserAssessment>,
  ) {
    this.loadAssessmentData();
  }

  async saveAssessment(
    userId: string,
    result: ScaleResultDto,
    answers: Record<string, string>,
  ): Promise<UserAssessment> {
    const assessment = this.userAssessmentRepository.create({
      userId,
      scale: result.scale,
      answers,
      readinessLevel: result.readinessLevel,
      phase: result.developmentPhase.phase,
    });

    return this.userAssessmentRepository.save(assessment);
  }

  async getUserAssessments(userId: string): Promise<UserAssessment[]> {
    return this.userAssessmentRepository.find({ where: { userId } });
  }
}
```

## Validation Rules

To add custom validation (e.g., ensure level is between 1-9):

```typescript
// dto/scale-assessment.dto.ts
import { IsString, IsObject, IsEnum, Min, Max, IsInt } from 'class-validator';

export class ScaleAnswersDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(9)
  selectedLevel: number;  // Change to number
}
```

## Testing

Create test files to ensure customizations work:

```typescript
// readiness-assessment.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ReadinessAssessmentService } from './readiness-assessment.service';

describe('ReadinessAssessmentService', () => {
  let service: ReadinessAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadinessAssessmentService],
    }).compile();

    service = module.get<ReadinessAssessmentService>(ReadinessAssessmentService);
  });

  it('should calculate correct readiness level', () => {
    const result = service.assessScale({
      scale: 'TRL',
      answers: {
        'TRL_Q1': '2',
        'TRL_Q2': '3',
        'TRL_Q3': '5',
        'TRL_Q4': '4',
        'TRL_Q5': '2',
        'TRL_Q6': '4',
        'TRL_Q7': '3',
      },
    });

    expect(result.readinessLevel).toBe(2);
    expect(result.developmentPhase.phase).toBe(1);
  });

  it('should identify gaps correctly', () => {
    const result = service.assessScale({
      scale: 'TRL',
      answers: {
        'TRL_Q1': '2',
        'TRL_Q2': '2',
        'TRL_Q3': '5',
        'TRL_Q4': '4',
        'TRL_Q5': '2',
        'TRL_Q6': '4',
        'TRL_Q7': '3',
      },
    });

    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.gaps[0]).toHaveProperty('questionId');
    expect(result.gaps[0]).toHaveProperty('gapDescription');
  });
});
```

---

## Quick Reference: Common Customizations

| What to Change | Where to Edit | Code Changes Needed? |
|---------------|---------------|---------------------|
| Add/Remove Question | `data/assessment-data.json` | No |
| Change Question Text | `data/assessment-data.json` | No |
| Change Level Descriptions | `data/assessment-data.json` | No |
| Change Gap Descriptions | `data/assessment-data.json` | No |
| Change Risk Descriptions | `data/assessment-data.json` | No |
| Change Phase Mapping | `data/assessment-data.json` | No |
| Add New Scale | `data/assessment-data.json` + DTOs + Service | Yes |
| Change Gap Logic | `readiness-assessment.service.ts` | Yes |
| Add Database Persistence | Create entities + Update module | Yes |
| Add Internationalization | Multiple JSON files or nested structure | Yes |

---

Remember: **Most changes only require editing the JSON file**, making the system highly flexible and maintainable!

