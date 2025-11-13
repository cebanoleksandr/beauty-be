import { servicesCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export const getAll = async ({ query, masterId }) => {
  try {
    const filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (masterId) {
      filter.masterIds = { $in: [new ObjectId(masterId)] };
    }

    const allServices = await servicesCollection.find(filter).toArray();
    console.log('Fetched all services:', allServices.length);

    return allServices;
  } catch (error) {
    console.error("Error fetching all services:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched service by "ID" ${id}:`, service ? 'found' : 'not found');

    if (service) {
      const { ...serviceWithoutPassword } = service;
      return serviceWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching service by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ title, price, duration_minutes, masterIds }) => {
  try {
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (price !== undefined) updateFields.price = price;
    if (duration_minutes !== undefined) updateFields.duration_minutes = duration_minutes;
    if (masterIds !== undefined) updateFields.masterIds = masterIds;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for service ID: ${id}`);
      return await getById(id);
    }

    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    console.log(`Service with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return null;
    }

    return await getById(id);
  } catch (error) {
    console.error(`Error updating service with "ID" ${id}:`, error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Service with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
};

export const create = async ({ title, price, duration_minutes, masterIds }) => {
  const newService = {
    title,
    price,
    duration_minutes,
    masterIds,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await servicesCollection.insertOne(newService);
  console.log(`Service with "ID": ${result.insertedId} created successfully.`);

  return newService;
};
