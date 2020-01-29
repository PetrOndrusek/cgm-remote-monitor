'use strict';

/**
 * Storage migration - add new capped collection eventLog
 * @param env
 * @param ctx
 * @returns {Promise<boolean>} - true when successful migration took place
 */
async function migrate (env, ctx) {

  if (await ctx.store.collectionExist(env.eventLog_collection))
    return false;

  await ctx.store.createCappedCollection(env.eventLog_collection, 1024 * 1024);

  return true;
}


module.exports = {
  migrate,
  name: 'Add eventLog collection'
};