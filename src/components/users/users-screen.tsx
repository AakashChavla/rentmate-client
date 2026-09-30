"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasPermission } from "@/hooks/use-permission";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  mutationError,
  useAssignRole,
  useRemoveRole,
  useRoleCatalog,
  useUpdateUser,
  useUsersList,
} from "@/hooks/use-users";
import { ApiError } from "@/lib/api/client";
import { lookupAssignmentId, type UserView } from "@/lib/api/resources/users";

const STATUSES = ["ACTIVE", "INVITED", "SUSPENDED"] as const;

const editSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  phone: z.string().max(32, "Phone is too long"),
  status: z.enum(STATUSES),
});

type EditValues = z.infer<typeof editSchema>;

const assignSchema = z.object({
  roleKey: z.string().min(1, "Choose a role"),
});

type AssignValues = z.infer<typeof assignSchema>;

function roleLabel(key: string): string {
  return key
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function UsersScreen() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const canUpdate = useHasPermission("user:update");
  const canAssign = useHasPermission("role:assign");
  const [editing, setEditing] = useState<UserView | null>(null);
  const [managing, setManaging] = useState<UserView | null>(null);

  const list = useUsersList({
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : (status as (typeof STATUSES)[number]),
  });

  const users = useMemo(
    () => list.data?.pages.flatMap((page) => page.users) ?? [],
    [list.data],
  );
  const editingUser = users.find((item) => item.id === editing?.id) ?? editing;
  const managingUser = users.find((item) => item.id === managing?.id) ?? managing;
  const lastPage = list.data?.pages.at(-1);

  const columns = useMemo<ColumnDef<UserView, unknown>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone || "—",
      },
      {
        id: "roles",
        header: "Roles",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              row.original.roles.map((role) => (
                <Badge key={`${role.key}-${role.scopeId}`} variant="secondary">
                  {roleLabel(role.key)}
                </Badge>
              ))
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canUpdate || canAssign ? (
            <div className="flex justify-end gap-2">
              {canUpdate ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(row.original)}>
                  Edit
                </Button>
              ) : null}
              {canAssign ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setManaging(row.original)}>
                  Manage roles
                </Button>
              ) : null}
            </div>
          ) : null,
      },
    ],
    [canAssign, canUpdate],
  );

  const requestId = list.error instanceof ApiError ? list.error.requestId : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="People who can sign in to this organization."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 space-y-1">
          <Label htmlFor="user-search">Search</Label>
          <Input
            id="user-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
          />
        </div>
        <div className="w-full space-y-1 sm:w-48">
          <Label htmlFor="user-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="user-status" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {roleLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {list.isPending ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : null}

      {list.isError ? (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p>Could not load users.</p>
          {requestId ? (
            <p className="mt-1 text-xs text-muted-foreground">Request ID {requestId}</p>
          ) : null}
        </div>
      ) : null}

      {!list.isPending && !list.isError ? (
        <DataTable
          columns={columns}
          data={users}
          hasNext={Boolean(list.hasNextPage)}
          nextCursor={lastPage?.page.nextCursor ?? null}
          onLoadMore={() => void list.fetchNextPage()}
          isLoadingMore={list.isFetchingNextPage}
          emptyTitle="No users"
          emptyDescription="No one matches this search."
        />
      ) : null}

      <EditUserDialog user={editingUser} onClose={() => setEditing(null)} />
      <ManageRolesDialog user={managingUser} onClose={() => setManaging(null)} />
    </div>
  );
}

function EditUserDialog({ user, onClose }: { user: UserView | null; onClose: () => void }) {
  const updateUser = useUpdateUser();
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      status: user?.status ?? "ACTIVE",
    },
  });

  async function onSubmit(values: EditValues) {
    if (!user) return;
    try {
      await updateUser.mutateAsync({
        userId: user.id,
        input: {
          fullName: values.fullName,
          phone: values.phone.trim() ? values.phone.trim() : null,
          status: values.status,
        },
      });
      toast.success("User updated");
      onClose();
    } catch (error) {
      const mapped = mutationError(error);
      toast.error(mapped.message);
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormInput control={form.control} name="fullName" label="Name" />
            <FormInput control={form.control} name="phone" label="Phone" />
            <FormSelect
              control={form.control}
              name="status"
              label="Status"
              options={STATUSES.map((item) => ({ value: item, label: roleLabel(item) }))}
            />
            <DialogFooter>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ManageRolesDialog({ user, onClose }: { user: UserView | null; onClose: () => void }) {
  const catalog = useRoleCatalog(Boolean(user));
  const assign = useAssignRole();
  const remove = useRemoveRole();
  const form = useForm<AssignValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { roleKey: "" },
  });

  async function onAssign(values: AssignValues) {
    if (!user) return;
    try {
      await assign.mutateAsync({ userId: user.id, roleKey: values.roleKey });
      toast.success("Role assigned");
      form.reset();
    } catch (error) {
      const mapped = mutationError(error);
      toast.error(mapped.message);
    }
  }

  async function onRemove(assignmentId: string) {
    if (!user) return;
    try {
      await remove.mutateAsync({ userId: user.id, assignmentId });
      toast.success("Role removed");
    } catch (error) {
      const mapped = mutationError(error);
      toast.error(mapped.message);
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>{user?.fullName}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {user?.roles.map((role) => {
            const assignmentId = user ? lookupAssignmentId(user.id, role) : undefined;
            return (
              <li key={`${role.key}-${role.scopeType}-${role.scopeId}`} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{roleLabel(role.key)}</p>
                  <p className="text-xs text-muted-foreground">{role.scopeType}</p>
                  {!assignmentId ? (
                    <p className="text-xs text-muted-foreground">
                      The user list does not include an assignment id, so this role cannot be removed until it is assigned again.
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!assignmentId || remove.isPending}
                  onClick={() => assignmentId && void onRemove(assignmentId)}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onAssign)} noValidate>
            <FormSelect
              control={form.control}
              name="roleKey"
              label="Add role"
              placeholder="Choose a role"
              options={(catalog.data ?? []).map((role) => ({
                value: role.key,
                label: role.name || roleLabel(role.key),
              }))}
            />
            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value="ORGANIZATION">
                <SelectTrigger aria-label="Scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORGANIZATION">Organization</SelectItem>
                  <SelectItem value="PROPERTY" disabled>
                    Property scope – coming soon
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={assign.isPending}>
                {assign.isPending ? "Adding…" : "Add role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
