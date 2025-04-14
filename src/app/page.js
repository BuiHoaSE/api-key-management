'use client';

import Link from "next/link"
import Image from "next/image"
import { Github, BarChart3, GitPullRequest, Star, GitBranch, ArrowRight } from "lucide-react"
import { useSession, signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleSignInButton from "@/app/components/GoogleSignInButton"

export default function LandingPage() {
  const { data: session } = useSession();

  const handleDashboardClick = (e) => {
    if (!session) {
      e.preventDefault();
      signIn('google', { callbackUrl: '/dashboard' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            <span className="text-xl font-bold gradient-heading">Github Analyzer</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link 
              href={session ? "/dashboard" : "#"} 
              onClick={handleDashboardClick}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile picture"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  {session.user?.name && (
                    <span className="text-sm font-medium hidden md:inline-block">
                      {session.user.name}
                    </span>
                  )}
                </div>
                <Link 
                  href="/dashboard" 
                  className="md:hidden"
                >
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <GoogleSignInButton />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="#" 
                  onClick={handleDashboardClick}
                  className="md:hidden"
                >
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <GoogleSignInButton />
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-4 py-12 text-center md:py-16">
          <div className="inline-block rounded-lg bg-black px-3 py-1 text-sm text-white mb-4">
            Features
          </div>
          <h1 className="gradient-heading max-w-3xl text-4xl font-bold md:text-6xl lg:text-7xl">
            Everything you need to analyze GitHub repositories
          </h1>
          <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our platform provides comprehensive insights and analytics for any open source GitHub repository.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <button className="btn-primary" onClick={handleDashboardClick}>
              <span>Get Started <ArrowRight className="inline-block h-4 w-4 ml-2" /></span>
            </button>
            <button className="btn-outline">
              <span>Learn More</span>
            </button>
          </div>
          
          {/* Repository Preview Block */}
          <div className="w-full max-w-3xl mt-8">
            <div className="relative overflow-hidden rounded-xl border bg-background p-4 shadow-xl">
              <div className="flex items-center gap-2 border-b pb-3">
                <Github className="h-5 w-5" />
                <div className="text-sm font-medium gradient-heading-cool">facebook/react</div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Repository Summary</div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    React is a JavaScript library for building user interfaces. Declarative, component-based, and
                    learn-once, write-anywhere.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <Star className="mx-auto h-5 w-5 text-yellow-500" />
                    <div className="mt-1 text-sm font-medium gradient-heading">212.5k</div>
                    <div className="text-xs text-muted-foreground">Stars</div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <GitBranch className="mx-auto h-5 w-5 text-green-500" />
                    <div className="mt-1 text-sm font-medium gradient-heading">42.8k</div>
                    <div className="text-xs text-muted-foreground">Forks</div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <GitPullRequest className="mx-auto h-5 w-5 text-blue-500" />
                    <div className="mt-1 text-sm font-medium gradient-heading">15.3k</div>
                    <div className="text-xs text-muted-foreground">PRs</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Latest Version</div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="font-medium gradient-heading-cool">v18.2.0</div>
                    <div className="text-xs text-muted-foreground">Released 3 months ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container py-12 md:py-16">
          <h2 className="text-center text-4xl font-bold mb-4" style={{ color: '#9333EA' }}>
            Features
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-[900px] mx-auto md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our platform provides powerful analytics and insights to help you understand GitHub repositories better.
          </p>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Repository Analytics</h3>
              <p className="text-gray-500 mb-4">Get detailed analytics on stars, forks, contributors, and more.</p>
              <p className="text-gray-700">Track repository growth over time and identify trends in community engagement.</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4">
                <GitPullRequest className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">PR Insights</h3>
              <p className="text-gray-500 mb-4">Stay updated on important pull requests and code changes.</p>
              <p className="text-gray-700">Get summaries of significant pull requests and understand their impact on the codebase.</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Star History</h3>
              <p className="text-gray-500 mb-4">Visualize star growth and identify key milestones.</p>
              <p className="text-gray-700">Understand what events and releases drove community interest and repository popularity.</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4">
                <Github className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Repository Summaries</h3>
              <p className="text-gray-500 mb-4">Get AI-generated summaries of repository purpose and structure.</p>
              <p className="text-gray-700">Quickly understand what a repository does and how it&apos;s organized without reading all the code.</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4">
                <GitBranch className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Version Tracking</h3>
              <p className="text-gray-500 mb-4">Track releases and version changes over time.</p>
              <p className="text-gray-700">Get notified about new releases and understand what changed between versions.</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Reports</h3>
              <p className="text-gray-500 mb-4">Generate custom reports for repositories you care about.</p>
              <p className="text-gray-700">Create and share custom analytics reports tailored to your specific needs.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="container py-12 md:py-16">
          <div className="inline-block rounded-lg bg-black px-3 py-1 text-sm text-white mb-4">
            Pricing
          </div>
          <h2 className="gradient-heading text-center text-3xl font-bold md:text-4xl mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-[900px] mx-auto md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Choose the plan that&apos;s right for you, from free to professional.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For individuals and hobbyists</CardDescription>
                <div className="mt-4 text-4xl font-bold">$0</div>
                <p className="text-sm text-muted-foreground">Forever free</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>5 repositories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Daily updates</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Custom reports</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span>API access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <button 
                  className="btn-secondary w-full"
                  onClick={handleDashboardClick}
                >
                  <span>Get Started</span>
                </button>
              </CardFooter>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Popular
                </div>
                <CardTitle className="mt-4">Pro</CardTitle>
                <CardDescription>For professionals and small teams</CardDescription>
                <div className="mt-4 text-4xl font-bold">$19</div>
                <p className="text-sm text-muted-foreground">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>50 repositories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Hourly updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Custom reports</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span>API access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <button 
                  className="btn-secondary w-full"
                  onClick={handleDashboardClick}
                >
                  <span>Get Started</span>
                </button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large teams and organizations</CardDescription>
                <div className="mt-4 text-4xl font-bold">$49</div>
                <p className="text-sm text-muted-foreground">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Unlimited repositories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Enterprise analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Real-time updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Custom reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>API access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <button 
                  className="btn-secondary w-full"
                  onClick={handleDashboardClick}
                >
                  <span>Get Started</span>
                </button>
              </CardFooter>
            </Card>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to unlock GitHub insights?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of developers and teams who use Github Analyzer to understand open source projects
                better.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <div className="flex justify-center space-x-2">
                <button 
                  className="btn-primary w-full"
                  onClick={handleDashboardClick}
                >
                  <span>Get Started for Free</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sign in with your Google account to get started.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            <p className="text-sm leading-loose text-center md:text-left">
              &copy; {new Date().getFullYear()} Github Analyzer. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
