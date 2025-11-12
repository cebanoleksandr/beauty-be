import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb+srv://cebanoleksandr_db_user:Bggo4QRkscagmY4f@cluster0.rxvrnxy.mongodb.net/?appName=Cluster0';

export const client = new MongoClient(mongoUri);

export const adminsCollection = client.db('beauty').collection('admins');
// export const postsCollection = client.db('beauty').collection('posts');
// export const commentsCollection = client.db('beauty').collection('comments');

export const runDb = async () => {
  try {
    await client.connect();
    await client.db('beauty').command({ ping : 1 });
    console.log("Connected to MongoDB!"); 
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    await client.close();
    throw error;
  }
};
