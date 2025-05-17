const { MongoClient } = require("mongodb");

// Connection strings
const sourceURI =
  "mongodb+srv://shsohel:VQa7ueO1rh8ydGed@prosohel.fgtcid2.mongodb.net";
// const targetURI =
//   "mongodb+srv://StrikeO001:Shahriar023$@strikeocluster001.global.mongocluster.cosmos.azure.com?retryWrites=true&w=majority";
const targetURI =
  "mongodb+srv://shsohel:Cn9QDPXe827EjdjS@eshop.okkgbbh.mongodb.net?retryWrites=true&w=majority";

async function migrateAllCollections() {
  const sourceClient = new MongoClient(sourceURI);
  const targetClient = new MongoClient(targetURI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDB = sourceClient.db("ziggasa");
    const targetDB = targetClient.db("ziggasa");

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
