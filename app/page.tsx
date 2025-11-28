import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, FileText, Activity, Key, ArrowRight, Sparkles, Check, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              BillFlow
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm animate-fade-in">
            <Zap className="h-4 w-4 text-primary" />
            <span>Enterprise-grade billing solution</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in">
            Subscription Billing
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-xl text-muted-foreground sm:text-2xl animate-fade-in">
            BillFlow is a powerful subscription billing management system that
            helps you handle invoices, subscriptions, and usage tracking with
            ease. Built for modern businesses.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row animate-fade-in">
            <Link href="/auth/signin">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2 hover:bg-muted/50">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful features to manage your entire billing lifecycle
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CreditCard,
                title: "Subscriptions",
                description: "Manage recurring subscriptions with flexible plans and automated renewals",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: FileText,
                title: "Invoices",
                description: "Generate and track invoices automatically with professional templates",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Activity,
                title: "Usage Tracking",
                description: "Monitor usage metrics and consumption in real-time with detailed analytics",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Key,
                title: "API Integration",
                description: "Integrate seamlessly with your app using our comprehensive REST API",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                <CardHeader className="relative">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Why Choose BillFlow?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Built with modern technology and best practices
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              "Automated invoice generation",
              "Real-time usage tracking",
              "Secure API integrations",
              "Multi-currency support",
              "Webhook notifications",
              "Comprehensive analytics",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
            <CardContent className="relative p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of businesses using BillFlow for their billing needs
              </p>
              <Link href="/auth/signin">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">BillFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BillFlow. Built for DBMS Course Project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
