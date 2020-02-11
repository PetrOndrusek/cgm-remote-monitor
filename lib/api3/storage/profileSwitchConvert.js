'use strict';

const _ = require('lodash')
  , moment = require('moment-timezone')
  , apiConst = require('../const')
  , dateTools = require('../shared/dateTools')
  , opTools = require('../shared/operationTools')
  ;


/**
 * Tries to parse date and utc offset from the profile document (in APIv1 structure) and the timezone string
 * @param {Object} profile
 * @param {string} timezone
 * @returns {Object}
 */
function parseDateFromProfile (profile, timezone) {

  const result = {};

  let m = dateTools.parseToMoment([ profile.created_at, profile.mills ]);
  if (m && m.isValid()) {
    result.date = m.valueOf();
    result.utcOffset = m.utcOffset();
  }
  else {
    result.date = (new Date()).getTime();
  }

  if (timezone) {
    try {
      result.utcOffset = moment().tz(timezone).utcOffset();
    }
    catch (err) {
      console.error(err);
    }
  }

  return result;
}


/**
 * Transform profiles from APIv1 structure to profiles switch templates (APIv3 structure)
 * @param {Array} profiles - array of profiles in APIv1 structure
 */
function profilesToApi3 (profiles) {
  const result = []
    , reservedProps = ['_id', 'defaultProfile', 'store']
    ;

  for (let profile of profiles) {
    for (let storeProp in profile.store) {
      if (Object.prototype.hasOwnProperty.call(profile.store, storeProp)) {
        let store = profile.store[storeProp];

        let template = _.cloneDeep(store);

        template.eventType = apiConst.EVENT_TYPE.PS_TEMPLATE;
        template.name = storeProp;

        // let's distribute all profile's not reserved properties into the template
        for (let profileProp in profile) {
          if (Object.prototype.hasOwnProperty.call(profile, profileProp)
            && reservedProps.indexOf(profileProp) < 0
            && typeof template[profileProp] === 'undefined') {

            template[profileProp] = _.cloneDeep(profile[profileProp]);
          }
        }

        template.app = template.app || apiConst.MIGRATION.MIGRATION_APP;
        template.isDefault = profile.defaultProfile === storeProp;

        const parsed = parseDateFromProfile(profile, store.timezone);
        template.date = parsed.date;
        template.srvCreated = parsed.date;
        template.utcOffset = parsed.utcOffset;
        template.srvModified = (new Date()).getTime();
        template.subject = apiConst.MIGRATION.MIGRATION_SUBJECT;
        template.identifier = opTools.calculateIdentifier(template);

        result.push(template);
      }
    }
  }

  return result;
}


/**
 * Transform profiles switch templates (APIv3 structure) back to APIv1 structure of profiles
 * @param {Array} profiles - array of profile switch templates (in APIv3 structure)
 */
function profilesToApi1 (profiles) {
  const result = [];

  console.log(profiles);

  return result;
}


module.exports = {
  profilesToApi3,
  profilesToApi1
};