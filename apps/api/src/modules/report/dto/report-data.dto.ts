export class GapDto {
  gapDescription: string;
  hasServices: boolean;
}

export class AnswerDto {
  question: string;
  answer: string;
  comment: string;
}

export class ScaleDataDto {
  level: number;
  phase: number;
  phaseName: string;
  phaseGoal: string;
  strategicFocus: string;
  primaryRisk: string;
  isLowest: boolean;
  gaps: GapDto[];
  answers: AnswerDto[];
}

export class ReportDataDto {
  trl: ScaleDataDto;
  mkrl: ScaleDataDto;
  mfrl: ScaleDataDto;
}
