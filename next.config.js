const withPWA = require("next-pwa");

module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    disable: process.env.NODE_ENV === "development",
    sw: "service-worker.js",
    register: true,
    dest: "public"
  }
});