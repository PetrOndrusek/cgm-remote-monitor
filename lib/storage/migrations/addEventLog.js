'use strict';

/**
 * Storage migration - add new capped collection eventLog
 * @param env
 * @param ctx
 * @returns {Promise<void>}
 */
async function migrate (env, ctx) {

  if (await ctx.store.collectionExist(env.eventLog_collection))
    return;

  await ctx.store.createCappedCollection(env.eventLog_collection, 1024 * 1024);
}

module.exports = migrate;