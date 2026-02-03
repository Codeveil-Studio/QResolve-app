import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Package, 
  AlertCircle, 
  BarChart3, 
  Zap, 
  Shield, 
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Package,
    title: 'Asset Tracking',
    description: 'Manage your entire inventory with QR codes for instant access',
  },
  {
    icon: AlertCircle,
    title: 'Issue Management',
    description: 'Report and track issues in real-time with priority-based workflows',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    description: 'Get predictive maintenance alerts and efficiency recommendations',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Role-based access control with complete audit trails',
  },
];

const pricingFeatures = [
  'Unlimited assets',
  'Unlimited issues',
  'QR code generation',
  'Real-time analytics',
  'AI-powered insights',
  'Team collaboration',
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, organization, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && organization) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && !organization) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">QResolve</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Streamline your asset operations
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Asset Management &{' '}
              <span className="text-gradient">Issue Tracking</span>{' '}
              Made Simple
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              QResolve helps teams track assets, manage issues, and gain AI-powered insights
              with QR-powered workflows. From inventory to resolution, all in one platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => navigate('/signup')} className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                Sign in
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to manage assets
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed for modern teams
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, scale as you grow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto max-w-lg"
          >
            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Pro Plan</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Metered billing based on usage
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {pricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-8 w-full" size="lg" onClick={() => navigate('/signup')}>
                Start 14-day Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center text-primary-foreground"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to streamline your operations?
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Join thousands of teams already using QResolve to manage their assets efficiently.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              onClick={() => navigate('/signup')}
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <QrCode className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">QResolve</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 QResolve. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
