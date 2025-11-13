import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb+srv://cebanoleksandr_db_user:Bggo4QRkscagmY4f@cluster0.rxvrnxy.mongodb.net/?appName=Cluster0';

export const client = new MongoClient(mongoUri);

export const adminsCollection = client.db('beauty').collection('admins');
export const clientsCollection = client.db('beauty').collection('clients');
export const servicesCollection = client.db('beauty').collection('services');
export const appointmentsCollection = client.db('beauty').collection('appointments');
export const materialsCollection = client.db('beauty').collection('materials');
export const sheduleCollection = client.db('beauty').collection('schedule');

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
