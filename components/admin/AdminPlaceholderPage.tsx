import React from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export interface AdminPlaceholderPageProps {
  title: string;
  category: string;
  description: string;
  actionLabel?: string;
  hrefPath: string;
}

export function AdminPlaceholderPage({
  title,
  category,
  description,
  actionLabel = "Add Record",
  hrefPath,
}: AdminPlaceholderPageProps) {
  return (
    <AdminLayout>
      <PageHeader
        title={title}
        subtitle={description}
        breadcrumbs={[
          { label: "Admin Portal", href: "/admin" },
          { label: category },
          { label: title },
        ]}
        badge={<Badge variant="outline">{category}</Badge>}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            {actionLabel}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{title} Placeholder View</CardTitle>
          <CardDescription>
            This page route (<code>{hrefPath}</code>) is rendered inside the reusable Admin Application Shell. Feature logic for {title} will be implemented in subsequent development steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center rounded-lg border border-dashed border-border bg-background-secondary text-text-secondary text-xs">
            <p className="font-semibold text-text-primary">
              Admin Shell Active Route: {hrefPath}
            </p>
            <p className="mt-1">
              Active sidebar highlight, topbar search, notification bell, and mobile drawer controls are active.
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
