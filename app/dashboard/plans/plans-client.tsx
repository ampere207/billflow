"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react"
import { CreatePlanDialog } from "@/components/dashboard/create-plan-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export function PlansClient({ plans }: { plans: any[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }

    try {
      // Note: In a real app, you'd have a DELETE endpoint
      // For now, we'll just show a message
      toast({
        variant: "destructive",
        title: "Not Implemented",
        description: "Plan deletion is not yet implemented. You can deactivate plans instead.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete plan",
      })
    }
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Plans</h1>
            <p className="mt-2 text-muted-foreground">
              Create and manage your subscription plans
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans && plans.length > 0 ? (
            plans.map((plan, index) => {
              const gradient = plan.is_active
                ? "from-blue-500 to-cyan-500"
                : "from-gray-500 to-slate-500"
              return (
                <Card
                  key={plan.id}
                  className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                            <DollarSign className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {plan.description || "No description"}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <Badge variant={plan.is_active ? "success" : "secondary"} className="text-xs">
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          {formatCurrency(Number(plan.price), plan.currency)}
                        </span>
                        <span className="text-muted-foreground">
                          /{plan.interval}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Created {formatDate(plan.created_at)}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="col-span-full border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No plans found</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                  Create your first subscription plan to get started
                </p>
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CreatePlanDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}

