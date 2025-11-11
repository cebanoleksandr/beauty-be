import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb+srv://cebanoleksandr_db_user:Bggo4QRkscagmY4f@cluster0.rxvrnxy.mongodb.net/?appName=Cluster0';

export const client = new MongoClient(mongoUri);

// export const usersCollection = client.db('network1').collection('users');
// export const postsCollection = client.db('network1').collection('posts');
// export const commentsCollection = client.db('network1').collection('comments');

export const runDb = async () => {
  try {
    await client.connect();
    await client.db('network1').command({ ping : 1 });
    console.log("Connected to MongoDB!"); 
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    await client.close();
    throw error;
  }
};
