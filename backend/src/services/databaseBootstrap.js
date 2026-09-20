const { ROLE_DEFINITIONS } = require('../constants/roleDefinitions');
const { CATEGORIES } = require('../constants/catalog');
const databaseBootstrapRepository = require('../repositories/databaseBootstrap.repository');

async function initializeDatabase() {
  await databaseBootstrapRepository.ensureCollections();
  await databaseBootstrapRepository.upsertRoles(ROLE_DEFINITIONS);
  await databaseBootstrapRepository.upsertCategories(CATEGORIES);

  const collections = await databaseBootstrapRepository.listCollections();
  return {
    database: databaseBootstrapRepository.databaseName(),
    collections: collections.map((item) => item.name).sort(),
    roles: ROLE_DEFINITIONS.map((item) => item.key),
    categoryCount: CATEGORIES.length
  };
}

module.exports = { initializeDatabase };
