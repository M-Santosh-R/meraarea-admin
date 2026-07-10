"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, MoreHorizontal, Plus, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteService } from "@/lib/actions/services";
import { Service } from "@/lib/types";

type ServiceRow = Service & { businessCount: number };

export function ServicesTable({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceRow | null>(null);

  const columns: ColumnDef<ServiceRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Service",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
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
      id: "businessesUsing",
      header: "Businesses Using",
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
            <DropdownMenuItem
              onClick={() => {
                setActiveService(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setActiveService(row.original);
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
        title="Services"
        description="Services are attached to businesses and used for search & filtering."
        actions={
          <Button
            onClick={() => {
              setActiveService(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Service
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={services}
        searchPlaceholder="Search services..."
        emptyIcon={ListChecks}
        emptyTitle="No services yet"
        emptyDescription="Get started by adding your first service."
        emptyAction={
          <Button
            size="sm"
            onClick={() => {
              setActiveService(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Service
          </Button>
        }
      />

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setActiveService(null);
        }}
        service={activeService}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this service?"
        description={`"${activeService?.name}" will be removed from all businesses using it.`}
        onConfirm={() => {
          if (!activeService) return;
          const id = activeService.id;
          startTransition(async () => {
            try {
              await deleteService(id);
              toast.success("Service deleted.");
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
