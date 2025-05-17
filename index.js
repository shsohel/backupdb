const { MongoClient } = require("mongodb");
require("dotenv").config();
// Connection strings
const sourceURI = process.env.SOURCE_DB;
// const targetURI =
//   "mongodb+srv://StrikeO001:Shahriar023$@strikeocluster001.global.mongocluster.cosmos.azure.com?retryWrites=true&w=majority";
const targetURI = process.env.TARGET_DB;

const sourceDbName = process.env.SOURCE_DB_NAME;
const targetDbName = process.env.TARGET_DB_NAME;

async function migrateAllCollections() {
  const sourceClient = new MongoClient(sourceURI);
  const targetClient = new MongoClient(targetURI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDB = sourceClient.db(sourceDbName);
    const targetDB = targetClient.db(targetDbName);

    // Get all collections
    const collections = await sourceDB.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);

      // Fetch data from source collection
      const sourceCollection = sourceDB.collection(collectionName);
      const data = await sourceCollection.find().toArray();

      if (data.length === 0) {
        console.log(`Skipping empty collection: ${collectionName}`);
        continue;
      }

      // Insert into target collection
      const targetCollection = targetDB.collection(collectionName);
      await targetCollection.insertMany(data);

      console.log(
        `✅ Migrated ${data.length} documents from ${collectionName}`,
      );
    }

    console.log("🎉 Migration completed for all collections.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

// Run the migration
migrateAllCollections();
