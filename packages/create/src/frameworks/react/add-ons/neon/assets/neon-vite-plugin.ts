import postgresPlugin from '@neondatabase/vite-plugin-postgres'

export default postgresPlugin({
  seed: {
    type: 'sql-script',
    path: 'db/init.sql',
  },
  referrer: 'create-tanstack',
  dotEnvKey: 'VITE_DATABASE_URL',
})
