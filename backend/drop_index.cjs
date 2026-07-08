// Drop the problematic unique index on orderCode
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://nguyenlong102910_db_user:zkKJNur6Y21tI7B3@ac-jukape9-shard-00-00.qg8erjo.mongodb.net:27017,ac-jukape9-shard-00-01.qg8erjo.mongodb.net:27017,ac-jukape9-shard-00-02.qg8erjo.mongodb.net:27017/jollibee?ssl=true&replicaSet=atlas-wg6ex8-shard-0&authSource=admin&appName=Cluster0";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('kitchensupplyorders');
  
  // List indexes
  const indexes = await collection.indexes();
  console.log('Current indexes on kitchensupplyorders:');
  indexes.forEach(idx => console.log(`  ${idx.name}:`, JSON.stringify(idx.key)));

  // Drop the unique orderCode index if it exists
  try {
    await collection.dropIndex('orderCode_1');
    console.log('✓ Dropped unique index orderCode_1');
  } catch (e) {
    console.log('orderCode_1 index not found:', e.message);
  }

  // Verify
  const indexesAfter = await collection.indexes();
  console.log('\nIndexes after cleanup:');
  indexesAfter.forEach(idx => console.log(`  ${idx.name}:`, JSON.stringify(idx.key)));
  
  await mongoose.disconnect();
  console.log('\nDone');
}

main().catch(err => { console.error(err); process.exit(1); });
