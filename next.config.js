/** @type {import('next').NextConfig} */
const path = require('path');


const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({ test: /\.glsl$/, loader: "raw-loader" })

    config.resolve.fallback = {
      ...config.resolve.fallback,
      indexedDB: false,
    };

    
    return config
  }
}

module.exports = nextConfig
