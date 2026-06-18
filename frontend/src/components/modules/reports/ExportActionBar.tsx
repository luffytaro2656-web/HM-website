import React from "react";
import { Download, FileSpreadsheet, Printer, Calendar, Landmark, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HOSPITALS } from "@/mocks/hospitals";

export type DateRangeOption = "7d" | "30d" | "this-month" | "this-quarter" | "this-year";

interface ExportActionBarProps {
  selectedHospitalId: string;
  onHospitalChange: (id: string) => void;
  selectedDateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
  onExport: (format: "pdf" | "excel" | "csv") => void;
  onPrint: () => void;
  // Role configuration for locking filters
  disabledHospitalSelect?: boolean;
  hospitalLockName?: string;
  availableTabsCount?: number;
}

export function ExportActionBar({
  selectedHospitalId,
  onHospitalChange,
  selectedDateRange,
  onDateRangeChange,
  onExport,
  onPrint,
  disabledHospitalSelect = false,
  hospitalLockName,
}: ExportActionBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card/60 p-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
      {/* Filters section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SlidersHorizontal className="size-3.5 text-primary" />
          <span>Filters:</span>
        </div>

        {/* Hospital Filter */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <div className="relative w-52">
            <Landmark className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Select
              value={selectedHospitalId}
              onValueChange={onHospitalChange}
              disabled={disabledHospitalSelect}
            >
              <SelectTrigger className="h-9 pl-9 text-xs">
                <SelectValue placeholder="All Hospitals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Hospitals (Network-wide)</SelectItem>
                {HOSPITALS.map((h) => (
                  <SelectItem key={h.id} value={h.id} className="text-xs">
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {disabledHospitalSelect && hospitalLockName && (
            <span className="text-[10px] text-amber-500 font-medium sm:ml-2">
              🔒 Locked to {hospitalLockName}
            </span>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative w-44">
          <Calendar className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select
            value={selectedDateRange}
            onValueChange={(val) => onDateRangeChange(val as DateRangeOption)}
          >
            <SelectTrigger className="h-9 pl-9 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
              <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
              <SelectItem value="this-month" className="text-xs">This Month (June)</SelectItem>
              <SelectItem value="this-quarter" className="text-xs">This Quarter</SelectItem>
              <SelectItem value="this-year" className="text-xs">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export / Print Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("pdf")}
          className="h-9 text-xs hover:bg-primary/5 hover:text-primary transition-all duration-200"
        >
          <Download className="mr-1.5 size-4 text-primary" />
          PDF Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("excel")}
          className="h-9 text-xs hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/30 transition-all duration-200"
        >
          <FileSpreadsheet className="mr-1.5 size-4 text-emerald-500" />
          Excel Spreadsheet
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="h-9 text-xs hover:bg-indigo-500/5 hover:text-indigo-600 hover:border-indigo-500/30 transition-all duration-200"
        >
          <Printer className="mr-1.5 size-4 text-indigo-500" />
          Print / PDF Preview
        </Button>
      </div>
    </div>
  );
}
