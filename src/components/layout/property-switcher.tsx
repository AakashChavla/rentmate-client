"use client";

import { Building2, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PropertySwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="max-w-[220px] justify-between gap-2"
          aria-label="Switch property"
        >
          <Building2 aria-hidden="true" />
          <span className="truncate">All properties</span>
          <ChevronsUpDown className="opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Properties</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          Property switching arrives in a later phase.
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
