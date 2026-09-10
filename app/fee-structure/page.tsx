import React from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PROGRAMS, MOCK_FEE_TYPES } from "@/lib/mock-data";
import { formatPKR } from "@/lib/utils";

export default function FeeStructurePage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <PageHeader
          title="Fee Structure Fall 2026"
          subtitle="Transparent itemized breakdown of tuition fees, admission charges, and lab funds."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Fee Structure" },
          ]}
          badge={<Badge variant="secondary">Pakistani Rupee (PKR)</Badge>}
        />

        {/* Annual Program Fee Table */}
        <Card>
          <CardHeader>
            <CardTitle>Program Tuition Fee Schedule</CardTitle>
            <CardDescription>
              Annual fee schedules approved by the college board for academic session 2026.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Program Code</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Annual Fee (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PROGRAMS.map((prog) => (
                  <TableRow key={prog.id}>
                    <TableCell className="font-bold text-text-primary">{prog.name}</TableCell>
                    <TableCell><Badge variant="outline">{prog.code}</Badge></TableCell>
                    <TableCell className="capitalize">{prog.level}</TableCell>
                    <TableCell>{prog.durationYears} Years</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatPKR(prog.annualFeePKR)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Itemized Additional Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Charges & Additional Funds</CardTitle>
            <CardDescription>Itemized fees applicable upon voucher issuance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Default Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_FEE_TYPES.map((ft) => (
                  <TableRow key={ft.id}>
                    <TableCell className="font-semibold">{ft.name}</TableCell>
                    <TableCell><Badge variant="secondary">{ft.category}</Badge></TableCell>
                    <TableCell className="text-xs text-text-secondary">{ft.description}</TableCell>
                    <TableCell className="text-right font-semibold">{formatPKR(ft.defaultAmountPKR)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
