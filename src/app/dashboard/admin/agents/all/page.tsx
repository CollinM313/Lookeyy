import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AllAgentsPage() {
  const agents = await prisma.agentProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">All agents</h2>
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Tours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <p className="font-medium">{a.user.name}</p>
                  <p className="text-xs text-muted-foreground">{a.user.email}</p>
                </TableCell>
                <TableCell>{a.coverageArea}</TableCell>
                <TableCell>
                  <Badge variant={a.status === "APPROVED" ? "default" : a.status === "PENDING" ? "secondary" : "outline"}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell>★ {a.ratingAvg.toFixed(1)} ({a.ratingCount})</TableCell>
                <TableCell>{a.tourCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
