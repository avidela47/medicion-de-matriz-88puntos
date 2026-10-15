module.exports = {
  apps: [
    {
      name: "matriz-88",
      cwd: "/var/www/medicion-de-matriz-88puntos",
      script: "npm",
      args: "run start -- -p 3003",
      env: { NODE_ENV: "production" },
    },
  ],
};
