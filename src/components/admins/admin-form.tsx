"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DiscardChangesDialog } from "@/components/shared/discard-changes-dialog";
import { createAdmin, updateAdmin } from "@/lib/actions/admins";
import { Admin, AdminRole, AdminStatus } from "@/lib/types";

interface FormState {
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  role: "editor",
  status: "active",
};

function adminToForm(admin: Admin): FormState {
  return {
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
  };
}

export function AdminForm({
  mode,
  admin: existing,
}: {
  mode: "create" | "edit";
  admin?: Admin | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(
    existing ? adminToForm(existing) : EMPTY_FORM
  );
  const [dirty, setDirty] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (mode === "edit" && !existing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm font-medium text-foreground">Admin not found</p>
        <p className="text-sm text-muted-foreground">
          They may have been removed. Go back to the admins list.
        </p>
        <Button variant="outline" onClick={() => router.push("/admins")}>
          <ArrowLeft className="size-4" />
          Back to Admins
        </Button>
      </div>
    );
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function handleCancel() {
    if (dirty) {
      setShowDiscard(true);
      return;
    }
    router.push("/admins");
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
      avatarUrl: existing?.avatarUrl ?? null,
    };
    startTransition(async () => {
      try {
        if (mode === "edit" && existing) {
          await updateAdmin(existing.id, payload);
          toast.success("Admin updated successfully.");
          setDirty(false);
          router.push("/admins");
        } else {
          const result = await createAdmin(payload);
          setDirty(false);
          setTempPassword(result.tempPassword);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleCancel} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {mode === "edit" ? existing?.name : "New Admin"}
              </h1>
              <StatusBadge status={form.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "edit" ? "Editing administrator access" : "Creating a new administrator"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {mode === "edit" ? "Save Changes" : "Create Admin"}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Admin Details</h3>
          <div className="space-y-1.5">
            <Label htmlFor="admin-name">Name</Label>
            <Input
              id="admin-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Priya Nair"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@meraarea.in"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v as AdminRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v as AdminStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {mode === "create" ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              A temporary password will be generated — share it with them directly, since
              there&apos;s no email delivery set up yet.
            </p>
          ) : null}
        </section>
      </div>

      <DiscardChangesDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          setDirty(false);
          router.push("/admins");
        }}
      />

      <Dialog open={Boolean(tempPassword)} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin created</DialogTitle>
            <DialogDescription>
              Share this temporary password with {form.name || "the new admin"} directly —
              it won&apos;t be shown again. They can sign in at the login page with it.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted px-3 py-2.5 text-center font-mono text-sm">
            {tempPassword}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (tempPassword) navigator.clipboard.writeText(tempPassword);
                toast.success("Password copied to clipboard.");
              }}
              variant="outline"
            >
              Copy password
            </Button>
            <Button
              onClick={() => {
                setTempPassword(null);
                router.push("/admins");
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
