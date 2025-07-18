import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, BarChart3, TrendingUp, Users, Check } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: BarChart3,
      title: "Multi-LLM Monitoring",
      description: "Track mentions across all major AI platforms including ChatGPT, Claude & Gemini"
    },
    {
      icon: TrendingUp,
      title: "Sentiment Analysis",
      description: "Understand how AI perceives your brand with advanced sentiment tracking"
    },
    {
      icon: Users,
      title: "Competitor Insights",
      description: "See your share of voice vs competitors in AI responses"
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "5 website analyses per month",
        "Basic sentiment tracking",
        "Email support"
      ]
    },
    {
      name: "Starter",
      price: "$49",
      description: "For small businesses",
      features: [
        "50 website analyses per month",
        "Advanced sentiment analysis",
        "Competitor tracking (3 competitors)",
        "Priority support",
        "Weekly reports"
      ],
      popular: true
    },
    {
      name: "Pro",
      price: "$129",
      description: "For growing companies",
      features: [
        "Unlimited analyses",
        "Advanced analytics dashboard",
        "Unlimited competitor tracking",
        "24/7 support",
        "Daily reports",
        "API access"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Beekon.ai</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            See How AI Chatbots Talk About Your Brand
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Monitor your visibility across ChatGPT, Claude & Gemini. Get actionable insights to improve your AI search presence.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link to="/auth">Start Free Analysis</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-4">Powerful AI Monitoring Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive insights into how AI models perceive and recommend your brand
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary">{tier.price}</div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-success" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.popular ? '' : 'variant-outline'}`}
                    variant={tier.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-lg">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-primary">Beekon.ai</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Beekon.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}