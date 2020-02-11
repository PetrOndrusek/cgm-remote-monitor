'use strict';

/**
 * Perform all storage migrations (that are still missing)
 * @param env
 * @param ctx
 * @returns {Promise<void>}
 */
async function migrate (env, ctx) {
  const migrations = [
    require('./addEventLog'),
    require('./importProfileSwitch')
  ];

  for (const migration of migrations) {
    if (await migration.migrate(env, ctx)) {
      ctx.log.info(`DB migration successful: ${migration.name}`);
    }
  }
}

module.exports = migrate;