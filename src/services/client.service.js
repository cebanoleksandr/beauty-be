import { clientsCollection } from '../db.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export const getAll = async (query) => {
  try {
    const filter = {};

    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }
    const allClients = await clientsCollection.find(filter).toArray();
    console.log('Fetched all clients:', allClients.length);

    return allClients.map(({ password, ...clientWithoutPassword }) => clientWithoutPassword);
  } catch (error) {
    console.error("Error fetching all clients:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const client = await clientsCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched client by "ID" ${id}:`, client ? 'found' : 'not found');

    if (client) {
      const { password, ...clientWithoutPassword } = client;
      return clientWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching client by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ 
  id, 
  firstName,
  lastName,
  photoUrl,
  coverPhotoUrl,
  contacts
}) => {
  try {
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (photoUrl !== undefined) updateFields.photoUrl = photoUrl;
    if (coverPhotoUrl !== undefined) updateFields.coverPhotoUrl = coverPhotoUrl;
    if (contacts !== undefined) updateFields.contacts = contacts;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for client ID: ${id}`);
      return await getById(id);
    }

    const result = await clientsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    console.log(`Client with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return null;
    }

    return await getById(id);
  } catch (error) {
    console.error(`Error updating client with "ID" ${id}:`, error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await clientsCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Client with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting client with ID ${id}:`, error);
    throw error;
  }
};

export const findByCredentials = async (email, plainTextPassword) => {
  try {
    const client = await clientsCollection.findOne({ email });
    if (!client) {
      return null;
    }

    const isMatch = await bcrypt.compare(plainTextPassword, client.password);
    if (isMatch) {
      const { password, ...clientWithoutPassword } = client;
      return clientWithoutPassword;
    } else {
      throw ApiError.badRequest('Wrong password');
    }
  } catch (error) {
    console.error("Error finding client by credentials:", error);
    throw error;
  }
};

export const create = async ({ email, password }) => {
  const existClient = await findByCredentials(email, password);

  if (existClient) {
    throw ApiError.badRequest('Client already exist', { email: 'Client already exist' });
  }

  const newClient = {
    email,
    password,
    firstName: null,
    lastName: null,
    photoUrl: null,
    coverPhotoUrl: null,
    contacts: {
      instagram: null,
      phone: null,
      telegram: null,
      facebook: null,
    },
    updatedAt: new Date(),
    createdAt: new Date(),
  }

  const result = await clientsCollection.insertOne(newClient);

  console.log(`Client with "id": ${result.insertedId} created successfully.`);

  return newClient;
}
