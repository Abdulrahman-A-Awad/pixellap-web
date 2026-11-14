/**
 * PM2 process for the production server (see pixellap-api/deploy/README.md).
 *
 *   pm2 startOrReload /var/www/pixellap-web/current/ecosystem.config.cjs --update-env
 *
 * `cwd` is the `current` symlink (not this file's real folder), so a reload after
 * deploy-web.sh switches the symlink starts the new release — and a rollback the old one.
 */
const cwd = process.env.PIXELLAP_WEB_CURRENT || '/var/www/pixellap-web/current';
const logs = process.env.PIXELLAP_WEB_LOGS || '/var/log/pixellap';

module.exports = {
  apps: [
    {
      name: 'pixellap-web',
      cwd,
      script: 'node_modules/next/dist/bin/next',
      // Loopback only: Nginx is the public entry point.
      args: 'start --hostname 127.0.0.1 --port 3000',
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '700M',
      kill_timeout: 8000,
      restart_delay: 2000,
      exp_backoff_restart_delay: 200,
      env: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      out_file: `${logs}/web.out.log`,
      error_file: `${logs}/web.error.log`,
      merge_logs: true,
      time: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
