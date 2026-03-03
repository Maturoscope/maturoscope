import {
  ReportDataDto,
  AnswerDto,
  RecommendedServicePayload,
  ScaleDataDto,
} from '../dto/report-data.dto';

// ── Height estimation constants (pixels) ──────────────────────────────
const PAGE_HEIGHT = 2040;
const NAV_HEIGHT = 80; // h-20
const FOOTER_HEIGHT = 96; // h-24
const PAGE_GAPS = 48; // gap-4 (16px) × 3 slots between nav/content/footer
const CONTENT_TOP_PADDING = 32; // mt-8 or top spacing inside content div

const USABLE_HEIGHT =
  PAGE_HEIGHT - NAV_HEIGHT - FOOTER_HEIGHT - PAGE_GAPS - CONTENT_TOP_PADDING;
// ≈ 1784px

// Overview section (page 1)
const OVERVIEW_TITLE_HEIGHT = 130; // title + project name + date
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

// Gap heights
const GAP_HEADER_HEIGHT = 80; // gap description text + pt-4/pb-6 padding + border
const GAP_SERVICE_LABEL_HEIGHT = 26; // "SERVICE AVAILABLE" label + margin
const GAP_SERVICE_NAME_HEIGHT = 24; // service name line (text-base font-medium)
const GAP_SERVICE_DESC_LINE_HEIGHT = 20; // each line of description text (text-sm)
const GAP_SERVICE_URL_HEIGHT = 30; // URL row with globe icon (mt-2.5 = 10px + text)
const GAP_SERVICE_SEPARATOR_HEIGHT = 28; // border-t + pt-3(12px) + mt-4(16px) between services
const GAP_SERVICE_ITEM_GAP = 8; // gap-1 within service (name/desc spacing)
const GAP_COMING_SOON_HEIGHT = 20; // "COMING SOON" label

// Text estimation for service descriptions
const SERVICE_DESC_CHARS_PER_LINE = 108; // ~900px max-width / ~8.3px per char at text-sm

// Answers section
const ANSWERS_TITLE_HEIGHT = 60; // "Your answers" heading
const ANSWERS_SCALE_LABEL_HEIGHT = 50; // scale label (e.g., "TRL") + margin
const ANSWER_CARD_BASE_HEIGHT = 110; // p-6(48) + question(28) + answer(24) + gap-2(8) + border/margin
const ANSWER_COMMENT_LINE_HEIGHT = 20; // each line of comment text (text-sm)
const ANSWER_COMMENT_CHARS_PER_LINE = 108; // ~900px max-width / ~8.3px per char at text-sm
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

function estimateServiceItemHeight(
  service: RecommendedServicePayload,
  isFirst: boolean,
): number {
  const descLines = estimateTextLines(
    service.description,
    SERVICE_DESC_CHARS_PER_LINE,
  );
  const urlHeight = service.url ? GAP_SERVICE_URL_HEIGHT : 0;
  const separatorHeight = isFirst ? 0 : GAP_SERVICE_SEPARATOR_HEIGHT;
  return (
    separatorHeight +
    GAP_SERVICE_NAME_HEIGHT +
    descLines * GAP_SERVICE_DESC_LINE_HEIGHT +
    GAP_SERVICE_ITEM_GAP +
    urlHeight
  );
}

function estimateAnswerHeight(answer: AnswerDto): number {
  const commentText = answer.comment || '-';
  const commentLines = estimateTextLines(commentText, ANSWER_COMMENT_CHARS_PER_LINE);
  return ANSWER_CARD_BASE_HEIGHT + commentLines * ANSWER_COMMENT_LINE_HEIGHT;
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
    this.ensureSpace(usedHeight + GAP_HEADER_HEIGHT);

    for (let gapIdx = 0; gapIdx < scale.gaps.length; gapIdx++) {
      const gap = scale.gaps[gapIdx];

      // Gap with no services (COMING SOON) - treat as atomic
      if (!gap.hasServices || gap.recommendedServices.length === 0) {
        const gapHeight = GAP_HEADER_HEIGHT + GAP_COMING_SOON_HEIGHT;

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

      // Gap with services - can be split across pages
      let serviceIdx = 0;
      let showGapHeader = true;

      let isFirstServiceInSlice = true; // first service of the current visual slice

      while (serviceIdx < gap.recommendedServices.length) {
        const service = gap.recommendedServices[serviceIdx];
        const serviceHeight = estimateServiceItemHeight(service, isFirstServiceInSlice);

        // Height needed to place this service
        let neededForThis = serviceHeight;
        if (showGapHeader) {
          neededForThis += GAP_HEADER_HEIGHT + GAP_SERVICE_LABEL_HEIGHT;
        }

        if (usedHeight + neededForThis > this.remainingHeight) {
          // Doesn't fit - flush current block and start new page
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
          isFirstServiceInSlice = true; // reset for new page slice

          // If gap header hasn't been shown yet, we still need it
          // If it was already shown, continuation won't show it
          // showGapHeader stays as-is

          // Recalculate service height now that it's first in slice
          const recalcHeight = estimateServiceItemHeight(service, true);
          neededForThis = recalcHeight;
          if (showGapHeader) {
            neededForThis += GAP_HEADER_HEIGHT + GAP_SERVICE_LABEL_HEIGHT;
          }
        }

        // Start or extend a slice for this gap
        const lastSlice =
          currentSlices.length > 0
            ? currentSlices[currentSlices.length - 1]
            : null;

        if (lastSlice && lastSlice.gapIndex === gapIdx) {
          // Extend existing slice
          lastSlice.serviceEndIndex = serviceIdx + 1;
        } else {
          // Start new slice
          currentSlices.push({
            gapIndex: gapIdx,
            serviceStartIndex: serviceIdx,
            serviceEndIndex: serviceIdx + 1,
            showGapHeader,
          });
        }

        // Use recalculated height if page break happened
        const finalServiceHeight = estimateServiceItemHeight(service, isFirstServiceInSlice);
        if (showGapHeader) {
          usedHeight += GAP_HEADER_HEIGHT + GAP_SERVICE_LABEL_HEIGHT;
          showGapHeader = false;
        }
        usedHeight += finalServiceHeight;
        isFirstServiceInSlice = false;
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
      const scale: ScaleDataDto = reportData[config.key];
      this.buildDetailedScale(config, scale, true);
    }

    // ── Answers section ──
    let isFirstAnswerBlock = true;

    for (const config of SCALE_CONFIGS) {
      const scale: ScaleDataDto = reportData[config.key];

      if (scale.answers.length === 0) continue;

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
