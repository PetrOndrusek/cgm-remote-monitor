'use strict';

const psConvert = require('../../api3/storage/profileSwitchConvert');

/**
 * Storage migration - add new collection profileSwitch and import documents from profile and treatments collection
 * @param env
 * @param ctx
 * @returns {Promise<boolean>} - true when successful migration took place
 */
async function migrate (env, ctx) {

  async function migrateProfiles () {
    return ctx.store.collection(env.profile_collection)
      .find()
      .toArray()
      .then(async function profilesLoaded (profiles) {

        const templates = psConvert.profilesToApi3(profiles);

        if (templates.length) {
          const colPS = ctx.store.collection(env.profileSwitch_collection);
          await colPS.insertMany(templates);
        }

        return templates.length;
      });
  }


  async function migrateProfileSwitches () {
    return ctx.store.collection(env.treatments_collection)
      .find({ eventType: 'Profile Switch'})
      .toArray()
      .then(async function psLoaded (profileSwitches) {
        console.log(profileSwitches);

        return profileSwitches.length;
      });
  }


  const anyPSDoc = await ctx.store.collection(env.profileSwitch_collection)
    .find({}, {_id: 1})
    .limit(1)
    .toArray();

  if (anyPSDoc.length)
    return false;

  const docCounts = await Promise.all([ migrateProfiles(), migrateProfileSwitches()]);
  const docCount = docCounts.reduce((a, b) => a + b);

  return docCount > 0;
}


module.exports = {
  migrate,
  name: 'Import into profileSwitch'
};