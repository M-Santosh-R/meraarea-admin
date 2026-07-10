"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Building2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
import { deleteBusiness } from "@/lib/actions/businesses";
import { areaName, categoryName } from "@/lib/selectors";
import { formatDate } from "@/lib/format";
import { Area, Business, Category } from "@/lib/types";

export function BusinessesTable({
  businesses,
  areas,
  categories,
}: {
  businesses: Business[];
  areas: Area[];
  categories: Category[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [areaFilter, setAreaFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (areaFilter !== "all" && b.areaId !== areaFilter) return false;
      if (categoryFilter !== "all" && b.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (featuredFilter === "featured" && !b.featuredHomepage && !b.featuredAreaPage)
        return false;
      if (featuredFilter === "not-featured" && (b.featuredHomepage || b.featuredAreaPage))
        return false;
      return true;
    });
  }, [businesses, areaFilter, categoryFilter, statusFilter, featuredFilter]);

  const columns: ColumnDef<Business, unknown>[] = [
    {
      accessorKey: "name",
      header: "Business",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{row.original.name}</span>
          {(row.original.featuredHomepage || row.original.featuredAreaPage) && (
            <Star className="size-3.5 fill-warning text-warning" />
          )}
        </div>
      ),
    },
    {
      id: "area",
      header: "Area",
      accessorFn: (row) => areaName(row.areaId, areas),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{areaName(row.original.areaId, areas)}</span>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorFn: (row) => categoryName(row.categoryId, categories),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {categoryName(row.original.categoryId, categories)}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.phone || "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
      ),
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
              <Link href={`/businesses/${row.original.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setActiveBusiness(row.original);
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
        title="Businesses"
        description="Manage every business listing on MeraArea."
        actions={
          <Button asChild>
            <Link href="/businesses/new">
              <Plus className="size-4" />
              Add Business
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search businesses by name..."
        emptyIcon={Building2}
        emptyTitle="No businesses found"
        emptyDescription="Try adjusting your filters, or add a new business."
        emptyAction={
          <Button size="sm" asChild>
            <Link href="/businesses/new">
              <Plus className="size-4" />
              Add Business
            </Link>
          </Button>
        }
        filters={
          <>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger size="sm" className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
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
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this business?"
        description={`"${activeBusiness?.name}" will be permanently removed from MeraArea.`}
        onConfirm={() => {
          if (!activeBusiness) return;
          const id = activeBusiness.id;
          startTransition(async () => {
            try {
              await deleteBusiness(id);
              toast.success("Business deleted.");
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
