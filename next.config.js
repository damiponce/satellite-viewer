/** @type {import('next').NextConfig} */
const path = require('path');


const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({ test: /\.glsl$/, loader: "raw-loader" })


    
    return config
  }
}

module.exports = nextConfig
