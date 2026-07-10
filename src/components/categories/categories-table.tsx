"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, MoreHorizontal, Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteCategory } from "@/lib/actions/categories";
import { Category } from "@/lib/types";

type CategoryRow = Category & { businessCount: number };

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryRow | null>(null);

  const columns: ColumnDef<CategoryRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <DynamicIcon name={row.original.icon} className="size-4 text-foreground" />
          </div>
          <span className="font-medium text-foreground">{row.original.name}</span>
        </div>
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
      id: "businessCount",
      header: "Businesses",
      accessorFn: (row) => row.businessCount,
      cell: ({ row }) => row.original.businessCount,
    },
    {
      accessorKey: "displayOrder",
      header: "Display Order",
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
              <Link href={`/categories/${row.original.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setActiveCategory(row.original);
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
        title="Categories"
        description="Group businesses into categories like Dentists or Restaurants."
        actions={
          <Button asChild>
            <Link href="/categories/new">
              <Plus className="size-4" />
              Add Category
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Search categories..."
        emptyIcon={Tags}
        emptyTitle="No categories yet"
        emptyDescription="Get started by adding your first category."
        emptyAction={
          <Button size="sm" asChild>
            <Link href="/categories/new">
              <Plus className="size-4" />
              Add Category
            </Link>
          </Button>
        }
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this category?"
        description={`"${activeCategory?.name}" will be permanently removed. Businesses in this category will need to be reassigned.`}
        onConfirm={() => {
          if (!activeCategory) return;
          const id = activeCategory.id;
          startTransition(async () => {
            try {
              await deleteCategory(id);
              toast.success("Category deleted.");
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
