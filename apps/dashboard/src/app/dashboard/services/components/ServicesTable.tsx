"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ServiceSummary } from "../types/service";

interface ServicesTableProps {
  services: ServiceSummary[];
  loading: boolean;
  onEdit: (service: ServiceSummary) => void;
  onDelete: (service: ServiceSummary) => void;
}

const SCALE_RANGE_COLORS = [
  { check: (level: number) => level >= 1 && level <= 3, color: "bg-[#FF6F63]" },
  { check: (level: number) => level >= 4 && level <= 6, color: "bg-[#FFB347]" },
  { check: (level: number) => level >= 7 && level <= 9, color: "bg-[#2DC071]" },
];

function ScaleBadge({ type, levels }: { type: string; levels: number[] }) {
  const sortedLevels = useMemo(
    () => [...new Set(levels)].sort((a, b) => a - b),
    [levels],
  );

  const activeDots = SCALE_RANGE_COLORS.map(({ check, color }) => ({
    active: sortedLevels.some(check),
    color,
  }));

  if (sortedLevels.length === 0) {
    return null;
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#0A0A0A]"
      title={sortedLevels.join(", ")}
    >
      <div className="flex items-center gap-1">
        {activeDots.map(({ active, color }, index) => (
          <span
            key={`${type}-${index}`}
            className={cn("h-2.5 w-2.5 rounded-full", active ? color : "bg-[#E5E5E5]")}
          />
        ))}
      </div>
      <span>{type}</span>
    </div>
  );
}

function ContactCell({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  if (!firstName && !lastName && !email) {
    return <span className="text-sm text-[#8C8C8C]">—</span>;
  }

  return (
    <div className="flex flex-col">
      <p className="text-sm font-semibold text-[#0A0A0A]">
        {[firstName, lastName].filter(Boolean).join(" ")}
      </p>
      <p className="text-sm text-[#8C8C8C]">{email}</p>
    </div>
  );
}

export function ServicesTable({
  services,
  loading,
  onEdit,
  onDelete,
}: ServicesTableProps) {
  const { t } = useTranslation("SERVICES");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedServices((prev) => {
      const next = new Set<string>();
      services.forEach((service) => {
        if (prev.has(service.id)) {
          next.add(service.id);
        }
      });
      return next;
    });
  }, [services]);

  const allSelected = services.length > 0 && selectedServices.size === services.length;
  const isPartiallySelected = selectedServices.size > 0 && !allSelected;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(new Set(services.map((service) => service.id)));
    } else {
      setSelectedServices(new Set());
    }
  };

  const toggleSelect = (serviceId: string, checked: boolean) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(serviceId);
      } else {
        next.delete(serviceId);
      }
      return next;
    });
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

  if (services.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
        style={{ height: 'calc(100vh - 230px)' }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-[#E5E5E5] shadow-xs mb-4">
          <User className="h-6 w-6 text-[#0A0A0A]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("TABLE.NO_RESULTS")}
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-md">
          {t("TABLE.EMPTY_DESCRIPTION")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
      <div className="overflow-auto">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="border-b border-[#E5E5E5]">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected ? true : isPartiallySelected ? "indeterminate" : false}
                  onCheckedChange={(value) => toggleSelectAll(Boolean(value))}
                  aria-label="Select all services"
                />
              </TableHead>
              <TableHead className="text-[#8C8C8C]">
                {t("TABLE.HEADERS.SERVICE")}
              </TableHead>
              <TableHead className="text-[#8C8C8C]">
                {t("TABLE.HEADERS.CATEGORY_SCALE")}
              </TableHead>
              <TableHead className="text-[#8C8C8C]">
                {t("TABLE.HEADERS.MAIN_CONTACT")}
              </TableHead>
              <TableHead className="text-[#8C8C8C]">
                {t("TABLE.HEADERS.SECONDARY_CONTACT")}
              </TableHead>
              <TableHead className="w-20 text-right text-[#8C8C8C]">
                {t("TABLE.HEADERS.ACTIONS")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => {
              const serviceSelected = selectedServices.has(service.id);
              return (
                <TableRow
                  key={service.id}
                  className="border-b border-[#F0F0F0] hover:bg-[#FDFDFE]"
                >
                  <TableCell className="w-12">
                    <Checkbox
                      checked={serviceSelected}
                      onCheckedChange={(value) =>
                        toggleSelect(service.id, Boolean(value))
                      }
                      aria-label={`Select ${service.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-[#0A0A0A]">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-sm text-[#8C8C8C]">{service.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.scales.length === 0 ? (
                      <span className="text-sm text-[#8C8C8C]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {service.scales.map((scale) => (
                          <ScaleBadge
                            key={scale.type}
                            type={scale.type}
                            levels={scale.levels}
                          />
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <ContactCell
                      firstName={service.mainContact.firstName}
                      lastName={service.mainContact.lastName}
                      email={service.mainContact.email}
                    />
                  </TableCell>
                  <TableCell>
                    <ContactCell
                      firstName={service.secondaryContact.firstName}
                      lastName={service.secondaryContact.lastName}
                      email={service.secondaryContact.email}
                    />
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem onClick={() => onEdit(service)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("TABLE.ACTIONS_MENU.EDIT")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(service)}
                          className="text-red-600"
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
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#E5E5E5] px-6 py-4 text-sm text-[#8C8C8C] sm:flex-row sm:items-center sm:justify-between">
        <p>{t("TABLE.FOOTER.SHOWING", { count: services.length })}</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span>{t("TABLE.FOOTER.ROWS_PER_PAGE")}</span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-[#E5E5E5] px-3 py-1 text-[#0A0A0A]"
            >
              12 <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[#0A0A0A]">1</span>
            <span className="text-[#8C8C8C]">/</span>
            <span className="text-[#8C8C8C]">1</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

