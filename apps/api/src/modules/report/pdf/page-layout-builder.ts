import {
  ReportDataDto,
  AnswerDto,
  GapDto,
  RecommendedServicePayload,
  ScaleDataDto,
} from '../dto/report-data.dto';

// ── Height estimation constants (pixels) ──────────────────────────────
const PAGE_HEIGHT = 2040;
const NAV_HEIGHT = 80; // h-20
// The footer renders on every page. Its EU funding text wraps to ~4 lines
// (text-xs, max-w-[680px]) inside p-6, so it is ~120px tall — noticeably more
// than the old 96px estimate, which let content bleed over it.
const FOOTER_HEIGHT = 130;
const PAGE_GAPS = 48; // gap-4 (16px) × 3 slots between nav/content/footer
const CONTENT_TOP_PADDING = 32; // mt-8 or top spacing inside content div

const USABLE_HEIGHT =
  PAGE_HEIGHT - NAV_HEIGHT - FOOTER_HEIGHT - PAGE_GAPS - CONTENT_TOP_PADDING;
// ≈ 1784px

// Overview section (page 1)
const OVERVIEW_TITLE_HEIGHT = 130; // title (optionally prefixed with project name, may wrap) + date
const OVERVIEW_CARDS_HEIGHT = 350; // 3 overview cards row
const OVERVIEW_SECTION_GAP = 36; // mb-9
const DETAILED_TITLE_HEIGHT = 80; // "Detailed report" heading + description
const OVERVIEW_TOTAL =
  OVERVIEW_TITLE_HEIGHT +
  OVERVIEW_CARDS_HEIGHT +
  OVERVIEW_SECTION_GAP +
  DETAILED_TITLE_HEIGHT;
// ≈ 596px

// Detailed card
const DETAILED_CARD_HEADER_HEIGHT = 60; // "To reach Level N" heading + gap
const DETAILED_CARD_SECTION_GAP = 24; // gap-6 between cards
const DETAILED_CARD_WRAPPER_PADDING = 48; // p-6 top + bottom on the white card

// Gap heights (services rendered as a 2-column table: Services | Description)
// Values are deliberately a touch generous so pagination breaks EARLY rather
// than risking a row/section being cut across a page boundary.
const GAP_HEADER_VPAD = 44; // "Gap N:" row pt-4 + spacing before the table
const GAP_HEADER_DESC_LINE_HEIGHT = 26; // each line of the gap description (text-base font-semibold)
const GAP_HEADER_DESC_CHARS_PER_LINE = 118; // ~1080px inner width / ~9px per char
const GAP_HEADER_PREFIX_CHARS = 9; // "Gap 12: " prefix added to the description
const GAP_HEADER_BADGE_HEIGHT = 26; // status badge (SERVICES AVAILABLE / COMING SOON) + margin

// Services table
const TABLE_COLUMN_HEADER_HEIGHT = 44; // "Services | Description" header row (bg, py-2.5)
const TABLE_ROW_VPAD = 32; // each row px-4 py-4 → 16 top + 16 bottom
const SERVICE_NAME_LINE_HEIGHT = 24; // service name (text-base font-semibold)
const SERVICE_NAME_CHARS_PER_LINE = 40; // ~380px "Services" column
const SERVICE_NAME_LINK_GAP = 6; // gap-1.5 between name and url
const SERVICE_LINK_HEIGHT = 24; // url row (text-sm + external-link icon)
const SERVICE_DESC_LINE_HEIGHT = 20; // each line of description (text-sm)
const SERVICE_DESC_CHARS_PER_LINE = 72; // ~620px "Description" column

// Answers section
const ANSWERS_TITLE_HEIGHT = 92; // "Your answers": mt-8(32) + text-2xl(~32) + mb-6(24)
const ANSWERS_SCALE_LABEL_HEIGHT = 50; // scale label text-xl(~28) + gap-4(16) to first card
// Base assumes a single-line question + divider + single-line answer. Extra
// lines for long questions/answers and the optional comment are added on top.
const ANSWER_CARD_BASE_HEIGHT = 135; // p-6(48) + question(28) + divider(my-3=24+1) + answer(24) + margins
const ANSWER_QUESTION_LINE_HEIGHT = 28; // each extra line of the question (text-lg)
const ANSWER_QUESTION_CHARS_PER_LINE = 100; // ~1030px card width / ~10px per char at text-lg
const ANSWER_TEXT_LINE_HEIGHT = 24; // each extra line of the answer text
const ANSWER_TEXT_CHARS_PER_LINE = 118; // ~1030px card width / ~8.7px per char
const ANSWER_COMMENT_LINE_HEIGHT = 20; // each line of comment text (text-sm)
// Comment now spans the full card width (~1344px, no max-w) → ~140 chars/line
// at text-sm (kept slightly conservative so it never underestimates).
const ANSWER_COMMENT_CHARS_PER_LINE = 140;
const ANSWER_COMMENT_TOP_GAP = 4; // mt-1 above the comment
const ANSWER_CARD_GAP = 8; // gap-2 between answer cards
const ANSWERS_SECTION_GAP = 36; // mb-9

// Disclaimer
const DISCLAIMER_HEIGHT = 80; // disclaimer text + margin

// ── Types ──────────────────────────────────────────────────────────────

type ScaleKey = 'trl' | 'mkrl' | 'mfrl';

interface ScaleConfig {
  key: ScaleKey;
  color: string;
  indexBgColor: string;
}

const SCALE_CONFIGS: ScaleConfig[] = [
  { key: 'trl', color: '#EA580C', indexBgColor: 'bg-orange-50' },
  { key: 'mkrl', color: '#0D9488', indexBgColor: 'bg-teal-50' },
  { key: 'mfrl', color: '#2563EB', indexBgColor: 'bg-blue-50' },
];

export interface GapSlice {
  gapIndex: number;
  serviceStartIndex: number;
  serviceEndIndex: number; // exclusive
  showGapHeader: boolean; // show gap description + SERVICE AVAILABLE / COMING SOON
}

export interface OverviewBlock {
  type: 'overview';
}

export interface DetailedTitleBlock {
  type: 'detailed-title';
}

export interface DetailedCardBlock {
  type: 'detailed-card';
  scaleKey: ScaleKey;
  color: string;
  indexBgColor: string;
  isFirstPageOfScale: boolean;
  gapSlices: GapSlice[];
}

export interface AnswersSectionBlock {
  type: 'answers-section';
  scaleKey: ScaleKey;
  answerStartIndex: number;
  answerEndIndex: number;
  showLabel: boolean;
  showTitle: boolean; // "Your answers" heading
}

export interface DisclaimerBlock {
  type: 'disclaimer';
}

export type ContentBlock =
  | OverviewBlock
  | DetailedTitleBlock
  | DetailedCardBlock
  | AnswersSectionBlock
  | DisclaimerBlock;

export interface PageDescriptor {
  blocks: ContentBlock[];
}

// ── Height estimators ──────────────────────────────────────────────────

function estimateTextLines(text: string, charsPerLine: number): number {
  if (!text) return 1;
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

// A single service row in the table. Its height is the taller of the two
// columns (name+link on the left, description on the right), plus row padding.
// Rows are treated as atomic — never split across a page.
function estimateServiceRowHeight(service: RecommendedServicePayload): number {
  const nameLines = estimateTextLines(service.name, SERVICE_NAME_CHARS_PER_LINE);
  const descLines = estimateTextLines(
    service.description,
    SERVICE_DESC_CHARS_PER_LINE,
  );
  const leftHeight =
    nameLines * SERVICE_NAME_LINE_HEIGHT +
    (service.url ? SERVICE_NAME_LINK_GAP + SERVICE_LINK_HEIGHT : 0);
  const rightHeight = descLines * SERVICE_DESC_LINE_HEIGHT;
  return TABLE_ROW_VPAD + Math.max(leftHeight, rightHeight);
}

// "Gap N: {description}" heading + status badge. The description can wrap.
function estimateGapHeaderHeight(gap: GapDto): number {
  const descLength = (gap.gapDescription || '').length + GAP_HEADER_PREFIX_CHARS;
  const descLines = Math.max(
    1,
    Math.ceil(descLength / GAP_HEADER_DESC_CHARS_PER_LINE),
  );
  return (
    GAP_HEADER_VPAD +
    descLines * GAP_HEADER_DESC_LINE_HEIGHT +
    GAP_HEADER_BADGE_HEIGHT
  );
}

function estimateAnswerHeight(answer: AnswerDto): number {
  // Every card is: question + divider + answer (all covered by the base). Only
  // the extra wrapped lines and the optional comment are added on top.
  const questionLines = estimateTextLines(
    answer.question,
    ANSWER_QUESTION_CHARS_PER_LINE,
  );
  // "Not applicable" renders a single short line where the answer would be.
  const answerLines = answer.notApplicable
    ? 1
    : estimateTextLines(answer.answer, ANSWER_TEXT_CHARS_PER_LINE);
  // Comment is only rendered when present (no "-" placeholder anymore). When it
  // is, it adds its own top gap (mt-1) plus one row per wrapped line.
  const hasComment = !answer.notApplicable && !!answer.comment;
  const commentLines = hasComment
    ? estimateTextLines(answer.comment, ANSWER_COMMENT_CHARS_PER_LINE)
    : 0;
  const commentHeight = hasComment
    ? ANSWER_COMMENT_TOP_GAP + commentLines * ANSWER_COMMENT_LINE_HEIGHT
    : 0;
  return (
    ANSWER_CARD_GAP +
    ANSWER_CARD_BASE_HEIGHT +
    Math.max(0, questionLines - 1) * ANSWER_QUESTION_LINE_HEIGHT +
    Math.max(0, answerLines - 1) * ANSWER_TEXT_LINE_HEIGHT +
    commentHeight
  );
}

// ── Page layout builder ────────────────────────────────────────────────

class PageBuilder {
  private pages: PageDescriptor[] = [];
  private currentPage: PageDescriptor;
  private remainingHeight: number;

  constructor() {
    this.currentPage = { blocks: [] };
    this.remainingHeight = USABLE_HEIGHT;
    this.pages.push(this.currentPage);
  }

  private startNewPage(): void {
    this.currentPage = { blocks: [] };
    this.remainingHeight = USABLE_HEIGHT;
    this.pages.push(this.currentPage);
  }

  private addBlock(block: ContentBlock, height: number): void {
    this.currentPage.blocks.push(block);
    this.remainingHeight -= height;
  }

  private ensureSpace(height: number): void {
    if (this.remainingHeight < height) {
      this.startNewPage();
    }
  }

  private buildDetailedScale(
    config: ScaleConfig,
    scale: ScaleDataDto,
    isFirstPageOfScale: boolean,
  ): void {
    // No gaps (level 9): render empty card
    if (scale.gaps.length === 0) {
      const cardHeight =
        DETAILED_CARD_HEADER_HEIGHT +
        DETAILED_CARD_WRAPPER_PADDING +
        DETAILED_CARD_SECTION_GAP;
      this.ensureSpace(cardHeight);
      this.addBlock(
        {
          type: 'detailed-card',
          scaleKey: config.key,
          color: config.color,
          indexBgColor: config.indexBgColor,
          isFirstPageOfScale,
          gapSlices: [],
        },
        cardHeight,
      );
      return;
    }

    let currentSlices: GapSlice[] = [];
    let currentBlockIsFirst = isFirstPageOfScale;

    // Card wrapper overhead for the current block
    const getWrapperHeight = (isFirst: boolean): number =>
      (isFirst
        ? DETAILED_CARD_HEADER_HEIGHT +
          DETAILED_CARD_WRAPPER_PADDING +
          DETAILED_CARD_SECTION_GAP
        : DETAILED_CARD_WRAPPER_PADDING + DETAILED_CARD_SECTION_GAP);

    let usedHeight = getWrapperHeight(currentBlockIsFirst);

    // Ensure space for the wrapper + at least something
    this.ensureSpace(usedHeight + estimateGapHeaderHeight(scale.gaps[0]));

    for (let gapIdx = 0; gapIdx < scale.gaps.length; gapIdx++) {
      const gap = scale.gaps[gapIdx];

      // Gap with no services (COMING SOON) - treat as atomic
      if (!gap.hasServices || gap.recommendedServices.length === 0) {
        const gapHeight = estimateGapHeaderHeight(gap);

        if (usedHeight + gapHeight > this.remainingHeight) {
          // Flush current block
          if (currentSlices.length > 0) {
            this.addBlock(
              {
                type: 'detailed-card',
                scaleKey: config.key,
                color: config.color,
                indexBgColor: config.indexBgColor,
                isFirstPageOfScale: currentBlockIsFirst,
                gapSlices: currentSlices,
              },
              usedHeight,
            );
            currentSlices = [];
            currentBlockIsFirst = false;
          }
          this.startNewPage();
          usedHeight = getWrapperHeight(false);
        }

        currentSlices.push({
          gapIndex: gapIdx,
          serviceStartIndex: 0,
          serviceEndIndex: 0,
          showGapHeader: true,
        });
        usedHeight += gapHeight;
        continue;
      }

      // Gap with services — the table can be split across pages, but never in
      // the middle of a row. Each slice repeats the "Services | Description"
      // header; the gap heading shows only once (first slice of the gap).
      const gapHeaderHeight = estimateGapHeaderHeight(gap);
      let serviceIdx = 0;
      let showGapHeader = true;
      let startingNewSlice = true;

      while (serviceIdx < gap.recommendedServices.length) {
        const service = gap.recommendedServices[serviceIdx];
        const rowHeight = estimateServiceRowHeight(service);

        // Fixed cost to open this service's slice on the current page.
        let sliceOverhead = 0;
        if (startingNewSlice) sliceOverhead += TABLE_COLUMN_HEADER_HEIGHT;
        if (showGapHeader) sliceOverhead += gapHeaderHeight;

        const isPageEmpty = currentSlices.length === 0;

        if (
          usedHeight + sliceOverhead + rowHeight > this.remainingHeight &&
          !isPageEmpty
        ) {
          // Doesn't fit and there's content to flush → break to a new page and
          // retry this same service (re-opening the slice with its header).
          this.addBlock(
            {
              type: 'detailed-card',
              scaleKey: config.key,
              color: config.color,
              indexBgColor: config.indexBgColor,
              isFirstPageOfScale: currentBlockIsFirst,
              gapSlices: currentSlices,
            },
            usedHeight,
          );
          currentSlices = [];
          currentBlockIsFirst = false;
          this.startNewPage();
          usedHeight = getWrapperHeight(false);
          startingNewSlice = true; // new page → repeat the table header
          continue;
        }

        // Place the service: open a new slice or extend the current one.
        const lastSlice =
          currentSlices.length > 0
            ? currentSlices[currentSlices.length - 1]
            : null;

        if (!startingNewSlice && lastSlice && lastSlice.gapIndex === gapIdx) {
          lastSlice.serviceEndIndex = serviceIdx + 1;
        } else {
          currentSlices.push({
            gapIndex: gapIdx,
            serviceStartIndex: serviceIdx,
            serviceEndIndex: serviceIdx + 1,
            showGapHeader,
          });
        }

        usedHeight += sliceOverhead + rowHeight;
        startingNewSlice = false;
        showGapHeader = false;
        serviceIdx++;
      }
    }

    // Flush remaining slices
    if (currentSlices.length > 0) {
      this.addBlock(
        {
          type: 'detailed-card',
          scaleKey: config.key,
          color: config.color,
          indexBgColor: config.indexBgColor,
          isFirstPageOfScale: currentBlockIsFirst,
          gapSlices: currentSlices,
        },
        usedHeight,
      );
    }
  }

  build(reportData: ReportDataDto): PageDescriptor[] {
    // ── Page 1: Overview + Detailed title + start of first scale gaps ──
    this.addBlock({ type: 'overview' }, OVERVIEW_TOTAL);
    this.addBlock({ type: 'detailed-title' }, 0); // already accounted in OVERVIEW_TOTAL

    // ── Detailed cards for each scale ──
    for (const config of SCALE_CONFIGS) {
      const scale = reportData[config.key];
      // Scale not assessed — skip its section entirely.
      if (!scale) continue;
      this.buildDetailedScale(config, scale, true);
    }

    // ── Answers section ──
    let isFirstAnswerBlock = true;

    for (const config of SCALE_CONFIGS) {
      const scale = reportData[config.key];

      if (!scale || scale.answers.length === 0) continue;

      let answerIndex = 0;
      let showLabel = true;

      while (answerIndex < scale.answers.length) {
        const titleHeight = isFirstAnswerBlock ? ANSWERS_TITLE_HEIGHT : 0;
        const labelHeight = showLabel
          ? ANSWERS_SCALE_LABEL_HEIGHT + ANSWERS_SECTION_GAP
          : 0;

        // Ensure space for title + label + at least 1 answer
        this.ensureSpace(titleHeight + labelHeight + estimateAnswerHeight(scale.answers[answerIndex]));

        const startIndex = answerIndex;
        let usedHeight = titleHeight + labelHeight;
        const showTitle = isFirstAnswerBlock;

        while (answerIndex < scale.answers.length) {
          const answerHeight = estimateAnswerHeight(scale.answers[answerIndex]);
          if (usedHeight + answerHeight > this.remainingHeight) {
            break;
          }
          usedHeight += answerHeight;
          answerIndex++;
        }

        // Force at least one answer
        if (answerIndex === startIndex) {
          usedHeight += estimateAnswerHeight(scale.answers[answerIndex]);
          answerIndex++;
        }

        this.addBlock(
          {
            type: 'answers-section',
            scaleKey: config.key,
            answerStartIndex: startIndex,
            answerEndIndex: answerIndex,
            showLabel,
            showTitle,
          },
          usedHeight,
        );

        isFirstAnswerBlock = false;
        showLabel = false;
      }
    }

    // ── Disclaimer ──
    this.ensureSpace(DISCLAIMER_HEIGHT);
    this.addBlock({ type: 'disclaimer' }, DISCLAIMER_HEIGHT);

    return this.pages;
  }
}

export function buildPageLayout(reportData: ReportDataDto): PageDescriptor[] {
  const builder = new PageBuilder();
  return builder.build(reportData);
}
