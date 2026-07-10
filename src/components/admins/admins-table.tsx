"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteAdmin } from "@/lib/actions/admins";
import { initials, formatRelativeTime } from "@/lib/format";
import { Admin } from "@/lib/types";

const ROLE_LABEL: Record<Admin["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

export function AdminsTable({
  admins,
  currentAdminId,
}: {
  admins: Admin[];
  currentAdminId: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeAdmin, setActiveAdmin] = useState<Admin | null>(null);

  const columns: ColumnDef<Admin, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(row.original.name)}
          </div>
          <div className="leading-tight">
            <p className="font-medium text-foreground">{row.original.name}</p>
            {row.original.id === currentAdminId ? (
              <p className="text-xs text-muted-foreground">You</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline">{ROLE_LABEL[row.original.role]}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "lastLogin",
      header: "Last Login",
      accessorFn: (row) => row.lastLoginAt ?? "",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatRelativeTime(row.original.lastLoginAt)}
        </span>
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
              <Link href={`/admins/${row.original.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={row.original.id === currentAdminId}
              onClick={() => {
                setActiveAdmin(row.original);
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
        title="Admins"
        description="Manage who has access to the MeraArea admin panel."
        actions={
          <Button asChild>
            <Link href="/admins/new">
              <Plus className="size-4" />
              Add Admin
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={admins}
        searchPlaceholder="Search admins by name or email..."
        emptyIcon={ShieldCheck}
        emptyTitle="No admins yet"
        emptyDescription="Invite your first administrator to get started."
        emptyAction={
          <Button size="sm" asChild>
            <Link href="/admins/new">
              <Plus className="size-4" />
              Add Admin
            </Link>
          </Button>
        }
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove this admin?"
        description={`"${activeAdmin?.name}" will lose access to the admin panel immediately.`}
        onConfirm={() => {
          if (!activeAdmin) return;
          const id = activeAdmin.id;
          startTransition(async () => {
            try {
              await deleteAdmin(id);
              toast.success("Admin removed.");
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
