import Link from "next/link";
import {
  Building2,
  MapPin,
  Tags,
  ListChecks,
  CheckCircle2,
  FileEdit,
  Plus,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { areaName, categoryName } from "@/lib/selectors";
import { formatDate } from "@/lib/format";
import { listAreas } from "@/lib/data/areas";
import { listCategories } from "@/lib/data/categories";
import { listServices } from "@/lib/data/services";
import { listBusinesses } from "@/lib/data/businesses";

export default async function DashboardPage() {
  const [areas, categories, services, businesses] = await Promise.all([
    listAreas(),
    listCategories(),
    listServices(),
    listBusinesses(),
  ]);

  const published = businesses.filter((b) => b.status === "published").length;
  const draft = businesses.filter((b) => b.status === "draft").length;

  const recent = businesses.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of everything happening on MeraArea."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/areas/new">
                <Plus className="size-4" />
                Add Area
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories/new">
                <Plus className="size-4" />
                Add Category
              </Link>
            </Button>
            <Button asChild>
              <Link href="/businesses/new">
                <Plus className="size-4" />
                Add Business
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Businesses" value={businesses.length} icon={Building2} tone="accent" />
        <StatCard label="Total Areas" value={areas.length} icon={MapPin} />
        <StatCard label="Total Categories" value={categories.length} icon={Tags} />
        <StatCard label="Total Services" value={services.length} icon={ListChecks} />
        <StatCard label="Published Businesses" value={published} icon={CheckCircle2} tone="success" />
        <StatCard label="Draft Businesses" value={draft} icon={FileEdit} tone="warning" />
      </div>

      <Card className="rounded-xl border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="text-base font-semibold">Recent Businesses</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/businesses">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Business
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Area
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{areaName(b.areaId, areas)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {categoryName(b.categoryId, categories)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/businesses/${b.id}/edit`}>
                            <Pencil className="size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
