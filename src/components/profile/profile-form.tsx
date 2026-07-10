"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { updateAdmin } from "@/lib/actions/admins";
import { initials, formatDate } from "@/lib/format";
import { Admin } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

export function ProfileForm({ admin }: { admin: Admin }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  function handleSaveProfile() {
    startTransition(async () => {
      try {
        await updateAdmin(admin.id, { name: name.trim(), email: email.trim() });
        toast.success("Profile updated successfully.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Password updated successfully.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account information and settings." />

      <Card className="rounded-xl border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Admin Information</CardTitle>
          <CardDescription>Your personal details and access level.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {initials(admin.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{admin.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline">{ROLE_LABEL[admin.role]}</Badge>
                <span className="text-xs text-muted-foreground">
                  Joined {formatDate(admin.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" required />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Profile Settings</CardTitle>
          <CardDescription>Manage notification and account preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified when a business needs review.
              </p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Product updates</p>
              <p className="text-xs text-muted-foreground">
                Occasional emails about new admin panel features.
              </p>
            </div>
            <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
