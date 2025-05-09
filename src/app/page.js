'use client';

import Link from "next/link"
import Image from "next/image"
import { Github, BarChart3, GitPullRequest, Star, GitBranch, ArrowRight, Menu, X } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Suspense, useState } from "react"
import GoogleSignInButton from "@/app/components/GoogleSignInButton"

export default function Home() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [apiKey, setApiKey] = useState('ak_EbrHbMqbBp4OcQm2fs0K3GzUILZrfFO6');
  const [apiResponse, setApiResponse] = useState({
    "data": {
      "summary": "#### English | 中文 | 日本語 | 한국어 # 🔎 GPT Researcher **GPT Researcher is an open deep research agent designed for both web and local research on any given task.**",
      "key_features": [],
      "cool_facts": [
        "#### English | 中文 | 日本語 | 한국어 # 🔎 GPT Researcher **GPT Researcher is an open deep research agent designed for both web and local research on any given task",
        "GPT Researcher provides a full suite of customization options to create tailor made and domain specific research agents",
        "## 👪 Multi-Agent Assistant As AI evolves from prompt engineering and RAG to multi-agent systems, we're excited to introduce our new multi-agent assistant built with LangGraph"
      ],
      "stars": 20987,
      "latest_version": "v3.2.7",
      "website": "https://gptr.dev",
      "license": "Apache License 2.0"
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleDashboardClick = (e) => {
    if (!session) {
      e.preventDefault();
      signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true
      });
    }
  };

  const handleSendRequest = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ repositoryUrl: repositoryUrl }),
      });

      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setApiResponse({ error: 'Failed to fetch response' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryItClick = (e) => {
    if (!session) {
      e.preventDefault();
      signIn('google', { 
        callbackUrl: '/playground',
        redirect: true
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFA347] via-[#FF5B51] to-[#FF4545]">
                Github Analyzer
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Pricing
              </Link>
              <Link 
                href={session ? "/dashboard" : "#"} 
                onClick={handleDashboardClick}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                {session ? (
                  <div className="flex items-center gap-3">
                    {session.user?.image && (
        <Image
                        src={session.user.image}
                        alt={session.user.name || "Profile picture"}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                    <button 
                      onClick={() => signOut()}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <GoogleSignInButton />
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="flex flex-col py-2">
              {session && (
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile picture"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{session.user?.name}</span>
                    <span className="text-xs text-gray-500">{session.user?.email}</span>
                  </div>
                </div>
              )}
              <Link 
                href="#features" 
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
          <Link
                href={session ? "/dashboard" : "#"} 
                onClick={(e) => {
                  handleDashboardClick(e);
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <div className="px-4 py-2.5 border-t border-gray-100">
                {session ? (
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Sign out
                  </button>
                ) : (
                  <GoogleSignInButton />
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-[64px] font-bold leading-[1.1] tracking-tight">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA347] via-[#FF5B51] to-[#FF4545]">
            Everything you need
            <br className="hidden sm:block" />
            to analyze GitHub
            <br className="hidden sm:block" />
            repositories
          </div>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-6 sm:mt-8 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Our platform provides comprehensive insights and analytics for any open source GitHub repository.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
          <button 
            onClick={handleDashboardClick}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#FFA347] via-[#FF5B51] to-[#FF4545] hover:opacity-90 transition-all flex items-center justify-center"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
          <Link href="#features" className="w-full sm:w-auto">
            <button className="w-full px-6 py-2.5 text-sm font-medium text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
              Learn More
            </button>
          </Link>
        </div>

        {/* Repository Preview Card */}
        <div className="mt-8 sm:mt-16 max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <Github className="h-5 w-5 text-gray-700" />
              <Link href="https://github.com/facebook/react" className="text-sm sm:text-base text-blue-600 hover:underline font-medium">
                facebook/react
              </Link>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-900">Repository Summary</h3>
              <p className="text-sm sm:text-base text-gray-600">
                React is a JavaScript library for building user interfaces. Declarative, component-based, and learn-once, write-anywhere.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-amber-500">
                  <Star className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span className="text-sm sm:text-base font-medium">212.5k</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Stars</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-emerald-500">
                  <GitBranch className="h-5 w-5" />
                  <span className="text-base font-medium">42.8k</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Forks</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-blue-500">
                  <GitPullRequest className="h-5 w-5" />
                  <span className="text-base font-medium">15.3k</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">PRs</div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t text-center">
              <div className="text-base font-medium text-violet-600">v18.2.0</div>
              <div className="text-sm text-gray-500 mt-1">Released 3 months ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] mb-4">
            Features
          </h2>
          <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
            Our platform provides powerful analytics and insights to help you understand GitHub repositories better.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Repository Analytics */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <BarChart3 className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Repository Analytics</h3>
              <p className="text-gray-600 mb-3">
                Get detailed analytics on stars, forks, contributors, and more.
              </p>
              <p className="text-gray-600">
                Track repository growth over time and identify trends in community engagement.
              </p>
            </div>

            {/* PR Insights */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <GitPullRequest className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">PR Insights</h3>
              <p className="text-gray-600 mb-3">
                Stay updated on important pull requests and code changes.
              </p>
              <p className="text-gray-600">
                Get summaries of significant pull requests and understand their impact on the codebase.
              </p>
            </div>

            {/* Star History */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <Star className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Star History</h3>
              <p className="text-gray-600 mb-3">
                Visualize star growth and identify key milestones.
              </p>
              <p className="text-gray-600">
                Understand what events and releases drove community interest and repository popularity.
              </p>
            </div>

            {/* Repository Summaries */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <Github className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Repository Summaries</h3>
              <p className="text-gray-600 mb-3">
                Get AI-generated summaries of repository purpose and structure.
              </p>
              <p className="text-gray-600">
                Quickly understand what a repository does and how it&apos;s organized without reading all the code.
              </p>
            </div>

            {/* Version Tracking */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <GitBranch className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Version Tracking</h3>
              <p className="text-gray-600 mb-3">
                Track releases and version changes over time.
              </p>
              <p className="text-gray-600">
                Get notified about new releases and understand what&apos;s changed between versions.
              </p>
            </div>

            {/* Custom Reports */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <BarChart3 className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom Reports</h3>
              <p className="text-gray-600 mb-3">
                Generate custom reports for repositories you care about.
              </p>
              <p className="text-gray-600">
                Create and share custom analytics reports tailored to your specific needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Try It Out Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#4169E1] mb-12">
            Try It Out
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Request */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">API Request</h3>
                <span className="text-sm text-gray-500">Edit the payload and send a request</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="text"
                    value="https://github.com/assafelovic/gpt-researcher"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <Link
                  href={session ? "/playground" : "#"}
                  onClick={handleTryItClick}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try It
                </Link>
              </div>
            </div>

            {/* API Response */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">API Response</h3>
                <span className="text-sm text-gray-500">View the response from the API</span>
              </div>
              <div className="bg-gray-50 rounded-md p-4 h-[300px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] mb-4">
            Pricing
          </h2>
          <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
            Choose the plan that&apos;s right for you, from free to professional.
          </p>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Free Plan */}
            <div className="relative flex flex-col p-8 bg-white rounded-2xl shadow-sm">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-black text-white text-sm font-medium px-3 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-2xl font-semibold">Free</h3>
              <p className="mt-2 text-gray-600">For individuals and hobbyists</p>
              <div className="mt-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-600 ml-1">Forever free</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">5 repositories</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Daily updates</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Custom reports</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">API access</span>
                </li>
              </ul>
              <button className="mt-8 w-full bg-gradient-to-r from-[#FF7B54] to-[#FF4444] text-white rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col p-8 bg-white rounded-2xl shadow-sm">
              <h3 className="text-2xl font-semibold">Pro</h3>
              <p className="mt-2 text-gray-600">For professionals and small teams</p>
              <div className="mt-6">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-gray-600 ml-1">per month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">50 repositories</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Hourly updates</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Custom reports</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">API access</span>
                </li>
              </ul>
              <button 
                disabled
                className="mt-8 w-full bg-gradient-to-r from-[#FF7B54] to-[#FF4444] text-white rounded-lg py-3 font-medium opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative flex flex-col p-8 bg-white rounded-2xl shadow-sm">
              <h3 className="text-2xl font-semibold">Enterprise</h3>
              <p className="mt-2 text-gray-600">For large teams and organizations</p>
              <div className="mt-6">
                <span className="text-5xl font-bold">$49</span>
                <span className="text-gray-600 ml-1">per month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Unlimited repositories</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Enterprise analytics</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Real-time updates</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">Custom reports</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-3">API access</span>
                </li>
              </ul>
              <button 
                disabled
                className="mt-8 w-full bg-gradient-to-r from-[#FF7B54] to-[#FF4444] text-white rounded-lg py-3 font-medium opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Github className="h-5 w-5" />
                <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFA347] via-[#FF5B51] to-[#FF4545]">
                  Github Analyzer
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Comprehensive insights for GitHub repositories
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
            © 2025 Github Analyzer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
