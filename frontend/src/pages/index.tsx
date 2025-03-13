import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const Home: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Cryus - AI-Powered Crypto Ecosystem Development Agent</title>
        <meta name="description" content="Cryus extends beyond asset management to support comprehensive development across the entire crypto lifecycle - from project conception and smart contract development to community governance and ecosystem integration." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center mb-20">
          <div className="w-48 h-48 relative mb-6">
            <Image 
              src="/logo.svg" 
              alt="Cryus Logo" 
              layout="fill"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
            AI-Powered Crypto <span className="text-secondary">Ecosystem</span> Development
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl text-gray-600">
            Your intelligent agent for the entire blockchain development lifecycle
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" passHref>
              <button className="px-8 py-3 bg-secondary hover:bg-secondary-dark text-white font-medium rounded-lg transition">
                Get Started
              </button>
            </Link>
            <Link href="#features" passHref>
              <button className="px-8 py-3 bg-white hover:bg-gray-100 text-primary border border-gray-300 font-medium rounded-lg transition">
                Learn More
              </button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-card hover:shadow-lg transition">
                <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white text-2xl font-bold mb-6">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Crypto Development?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the revolution in AI-powered blockchain development today
          </p>
          <Link href="/signup" passHref>
            <button className="px-8 py-3 bg-white text-secondary hover:bg-gray-100 font-medium rounded-lg transition">
              Start Building Now
            </button>
          </Link>
        </section>
      </main>

      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Cryus</h3>
              <p className="text-gray-400">AI-Powered Crypto Ecosystem Development</p>
            </div>
            <div className="flex gap-8">
              <Link href="https://x.com/cryusxyz" passHref target="_blank" rel="noopener noreferrer">
                <span className="hover:text-secondary-light transition cursor-pointer">Twitter</span>
              </Link>
              <Link href="https://github.com/Cryus-tech/Cryus" passHref target="_blank" rel="noopener noreferrer">
                <span className="hover:text-secondary-light transition cursor-pointer">GitHub</span>
              </Link>
              <Link href="https://cryus.xyz" passHref target="_blank" rel="noopener noreferrer">
                <span className="hover:text-secondary-light transition cursor-pointer">Website</span>
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Cryus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

// Data
const features = [
  {
    icon: '📝',
    title: 'Whitepaper Generator',
    description: 'Automatically create structured, logical whitepaper drafts tailored to your project',
  },
  {
    icon: '💰',
    title: 'Token Economics',
    description: 'Design sustainable, market-aligned tokenomics models for long-term success',
  },
  {
    icon: '📊',
    title: 'Smart Contract Development',
    description: 'Generate high-quality, secure smart contract code across multiple blockchains',
  },
  {
    icon: '🔧',
    title: 'Dapp Creation',
    description: 'Automate the development of decentralized applications with intuitive interfaces',
  },
];

const steps = [
  {
    title: 'Define Your Project',
    description: 'Answer a few questions about your project goals, target audience, and technical requirements',
  },
  {
    title: 'AI Creates Your Assets',
    description: 'Our AI agent generates all necessary components - from documentation to code to economic models',
  },
  {
    title: 'Review & Deploy',
    description: 'Review the generated assets, make any adjustments, and deploy to your chosen blockchain',
  },
]; 