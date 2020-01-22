'use strict';

/**
 * Perform all storage migrations (that are still missing)
 * @param env
 * @param ctx
 * @returns {Promise<void>}
 */
async function migrate (env, ctx) {
  const migrations = [
    require('./addEventLog')
  ];

  for (const migration of migrations) {
    await migration(env, ctx);
  }
}

module.exports = migrate;