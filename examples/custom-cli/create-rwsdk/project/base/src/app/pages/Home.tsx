"use client";

import Logo from "../../logo.svg?url";

export const Home = () => {
  const features = [
    {
      icon: "⚛️",
      title: "React Server Components",
      description:
        "Build with the latest React architecture. Stream HTML, reduce bundle sizes, and create lightning-fast experiences with true server-side rendering.",
    },
    {
      icon: "☁️",
      title: "Cloudflare-Native",
      description:
        "Deploy globally in seconds on Cloudflare Workers. Access D1 (SQL), R2 (Storage), KV, Durable Objects, Queues, and AI—all with zero config.",
    },
    {
      icon: "🔄",
      title: "Real-time by Default",
      description:
        "WebSockets, Server-Sent Events, and Cloudflare Durable Objects make real-time features effortless. Build chat, notifications, and live updates with ease.",
    },
    {
      icon: "🎨",
      title: "Modern DX",
      description:
        "Full TypeScript support, Vite-powered dev server, Tailwind CSS, and hot module replacement. The modern stack you love, with no configuration headaches.",
    },
    {
      icon: "🚀",
      title: "Server Functions",
      description:
        "Write backend logic alongside your components. Type-safe, co-located, and automatically bundled—no API routes needed.",
    },
    {
      icon: "⚡",
      title: "Edge Performance",
      description:
        "Sub-50ms response times worldwide. Your app runs on Cloudflare's global network, putting your code closer to every user.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={Logo} alt="RedwoodSDK" className="h-16 w-auto" />
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Build Personal Software
              <br />
              Without Limits
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
              RedwoodSDK empowers you to create full-stack applications with
              React Server Components, deployed globally on Cloudflare's edge
              network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://docs.rwsdk.com/getting-started/quick-start/"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
              >
                Get Started →
              </a>
              <a
                href="https://docs.rwsdk.com/"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 transition-all"
              >
                Read the Docs
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">
                &lt;50ms
              </div>
              <div className="text-gray-400">Response Times</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                300+
              </div>
              <div className="text-gray-400">Edge Locations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">Zero</div>
              <div className="text-gray-400">Configuration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Everything You Need to Build Modern Apps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-900/20 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cloudflare Bindings Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Full Cloudflare Platform Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "D1", desc: "SQL Database" },
              { name: "R2", desc: "Object Storage" },
              { name: "KV", desc: "Key-Value Store" },
              { name: "Queues", desc: "Message Queues" },
              { name: "Durable Objects", desc: "Stateful Instances" },
              { name: "Workers AI", desc: "AI Inference" },
              { name: "Vectorize", desc: "Vector Database" },
              { name: "Hyperdrive", desc: "Database Pooling" },
            ].map((binding, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center hover:border-orange-500/50 transition-all"
              >
                <div className="font-mono font-bold text-orange-400 mb-1">
                  {binding.name}
                </div>
                <div className="text-sm text-gray-400">{binding.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Join developers building the next generation of personal software with
          RedwoodSDK.
        </p>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="font-mono text-left">
            <span className="text-green-400">$</span>
            <span className="text-gray-100 ml-2">
              npx create-rwsdk-app my-app
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
