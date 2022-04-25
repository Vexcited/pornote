const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa");

module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    disable: process.env.NODE_ENV === "development",
    sw: "service-worker.js",
    register: true,
    dest: "public",
    runtimeCaching
  },
  async rewrites() {
    return [
      {
        source: "/proxy/geolocation",
        destination: "https://www.index-education.com/swie/geoloc.php"
      }
    ]
  }
});

