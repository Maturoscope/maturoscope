"use client";

import React, { useMemo } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ServiceSummary } from "../types/service";

interface ServicesTableProps {
  services: ServiceSummary[];
  loading: boolean;
  onEdit: (service: ServiceSummary) => void;
  onDelete: (service: ServiceSummary) => void;
  onView?: (service: ServiceSummary) => void;
}

const SCALE_RANGES = [
  { min: 1, max: 3, color: "#C50D30", borderColor: "#A00B30" },
  { min: 4, max: 6, color: "#FF9A46", borderColor: "#E68A3E" },
  { min: 7, max: 9, color: "#2DC071", borderColor: "#25A85D" },
];

function ScaleBadge({ type, levels }: { type: string; levels: number[] }) {
  const sortedLevels = useMemo(
    () => [...new Set(levels)].sort((a, b) => a - b),
    [levels],
  );

  const activeRanges = SCALE_RANGES.filter((range) =>
    sortedLevels.some((level) => level >= range.min && level <= range.max)
  ).map((range) => ({
    color: range.color,
    borderColor: range.borderColor,
  }));

  if (sortedLevels.length === 0 || activeRanges.length === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#0A0A0A] cursor-pointer">
          <div className="flex items-center">
            {activeRanges.map(({ color, borderColor }, index) => (
              <span
                key={`${type}-dot-${index}`}
                  className={cn(
                  "h-3 w-3 rounded-full border-2",
                  index > 0 && "-ml-1.5"
                )}
                style={{
                  backgroundColor: color,
                  borderColor: borderColor,
                }}
              />
            ))}
          </div>
          <span>{type}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-[#0A0A0A] text-white border-none"
        sideOffset={8}
      >
        {sortedLevels.join(", ")}
      </TooltipContent>
    </Tooltip>
  );
}

function ContactCell({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  
  if (!fullName) {
    return <span className="text-sm text-[#8C8C8C]">—</span>;
  }

  return (
    <p className="text-sm font-normal text-[#0A0A0A]">
      {fullName}
    </p>
  );
}

export function ServicesTable({
  services,
  loading,
  onEdit,
  onDelete,
  onView,
}: ServicesTableProps) {
  const { t, i18n } = useTranslation("SERVICES");
  const currentLanguageCode = i18n.language?.toUpperCase().startsWith("FR") ? "FR" : "EN";

  const getTranslatedName = (service: ServiceSummary) => {
    if (currentLanguageCode === "FR" && service.nameFr) {
      return service.nameFr;
    }
    if (currentLanguageCode === "EN" && service.nameEn) {
      return service.nameEn;
    }
    return service.nameEn;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{t("TABLE.LOADING")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white shadow-sm">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
        <div className="relative w-full">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="bg-[#F5F5F5]">
              <TableRow className="border-b border-[#E5E5E5] sticky top-0 z-10 bg-[#F5F5F5]">
              <TableHead className="px-6 py-3 text-[#0A0A0A] font-medium align-middle bg-[#F5F5F5]">
                {t("TABLE.HEADERS.SERVICE")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[#0A0A0A] font-medium align-middle bg-[#F5F5F5]">
                {t("TABLE.HEADERS.CATEGORY_SCALE")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[#0A0A0A] font-medium align-middle bg-[#F5F5F5]">
                {t("TABLE.HEADERS.MAIN_CONTACT")}
              </TableHead>
              <TableHead className="px-6 py-3 text-[#0A0A0A] font-medium align-middle bg-[#F5F5F5]">
                {t("TABLE.HEADERS.SECONDARY_CONTACT")}
              </TableHead>
              <TableHead className="px-6 py-3 w-20 text-right align-middle bg-[#F5F5F5]">
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => {
              return (
                <TableRow
                  key={service.id}
                  className="border-b border-[#F0F0F0] hover:bg-[#FDFDFE] cursor-pointer"
                  onClick={() => onView?.(service)}
                >
                  <TableCell className="px-6 py-4 align-middle">
                    <p className="text-sm font-normal text-[#0A0A0A]">
                      {getTranslatedName(service)}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 align-middle">
                    {service.scales.length === 0 ? (
                      <span className="text-sm text-[#8C8C8C]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {service.scales
                          .sort((a, b) => {
                            const order: Record<string, number> = {
                              TRL: 0,
                              MkRL: 1,
                              MfRL: 2,
                            };
                            return (order[a.type] ?? 999) - (order[b.type] ?? 999);
                          })
                          .map((scale) => (
                            <ScaleBadge
                              key={scale.type}
                              type={scale.type}
                              levels={scale.levels}
                            />
                          ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 align-middle">
                    <ContactCell
                      firstName={service.mainContact.firstName}
                      lastName={service.mainContact.lastName}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 align-middle">
                    <ContactCell
                      firstName={service.secondaryContact.firstName}
                      lastName={service.secondaryContact.lastName}
                    />
                  </TableCell>
                  <TableCell 
                    className="px-6 py-4 text-right align-middle" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-transparent hover:border-[#E5E5E5]"
                        >
                          <MoreVertical className="h-4 w-4 text-[#8C8C8C]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onEdit(service)}
                          className="text-[#0A0A0A] focus:text-[#0A0A0A] hover:text-[#0A0A0A] [&>svg]:text-[#0A0A0A] [&>svg]:focus:text-[#0A0A0A] [&>svg]:hover:text-[#0A0A0A]"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("TABLE.ACTIONS_MENU.EDIT")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(service)}
                          className="text-red-600 focus:text-red-600 hover:text-red-600 [&>svg]:text-red-600 [&>svg]:focus:text-red-600 [&>svg]:hover:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("TABLE.ACTIONS_MENU.DELETE")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            </TableBody>
          </table>
        </div>
      </div>
    </div>

    {!loading && services.length === 0 && (
      <div className="flex w-full flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-[#E5E5E5] bg-white mt-[-15px]" style={{ height: 'calc(100vh - 265px)' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E5E5] shadow-xs">
          <FileText className="h-6 w-6 text-[#0A0A0A]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">
            {t("TABLE.NO_RESULTS")}
          </h3>
          <p className="text-sm text-[#737373]">
            {t("TABLE.EMPTY_DESCRIPTION")}
          </p>
        </div>
      </div>
    )}
    </>
  );
}

