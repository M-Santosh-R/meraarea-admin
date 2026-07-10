"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, MoreHorizontal, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteArea } from "@/lib/actions/areas";
import { Area } from "@/lib/types";

type AreaRow = Area & { businessCount: number };

export function AreasTable({ areas }: { areas: AreaRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeArea, setActiveArea] = useState<AreaRow | null>(null);

  const filtered = useMemo(() => {
    return areas.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [areas, typeFilter, statusFilter]);

  const columns: ColumnDef<AreaRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Area Name",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground">/{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: "parent",
      header: "Parent Area",
      accessorFn: (row) =>
        areas.find((a) => a.id === row.parentId)?.name ?? "—",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {areas.find((a) => a.id === row.original.parentId)?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "businessCount",
      header: "Businesses",
      accessorFn: (row) => row.businessCount,
      cell: ({ row }) => row.original.businessCount,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/areas/${row.original.id}/edit`}>
                <Eye className="size-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/areas/${row.original.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setActiveArea(row.original);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Areas"
        description="Manage the locations businesses are organized under."
        actions={
          <Button asChild>
            <Link href="/areas/new">
              <Plus className="size-4" />
              Add Area
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search areas by name or slug..."
        emptyIcon={MapPin}
        emptyTitle="No areas yet"
        emptyDescription="Get started by adding your first area."
        emptyAction={
          <Button size="sm" asChild>
            <Link href="/areas/new">
              <Plus className="size-4" />
              Add Area
            </Link>
          </Button>
        }
        filters={
          <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="locality">Locality</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this area?"
        description={`"${activeArea?.name}" will be permanently removed. Businesses in this area will need to be reassigned.`}
        onConfirm={() => {
          if (!activeArea) return;
          const id = activeArea.id;
          startTransition(async () => {
            try {
              await deleteArea(id);
              toast.success("Area deleted.");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Something went wrong.");
            }
          });
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
