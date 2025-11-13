import { materialsCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export const getAll = async ({ query }) => {
  try {
    const filter = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
      ];
    }

    const allMaterials = await materialsCollection.find(filter).toArray();
    console.log('Fetched all materials:', allMaterials.length);

    return allMaterials;
  } catch (error) {
    console.error("Error fetching all materials:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const material = await materialsCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched material by "ID" ${id}:`, material ? 'found' : 'not found');

    if (material) {
      return material;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching material by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ title, quantity, unit, lowStockThreshold }) => {
  try {
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (quantity !== undefined) updateFields.quantity = quantity;
    if (unit !== undefined) updateFields.unit = unit;
    if (lowStockThreshold !== undefined) updateFields.lowStockThreshold = lowStockThreshold;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for material ID: ${id}`);
      return await getById(id);
    }

    const result = await materialsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    console.log(`Material with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return null;
    }

    return await getById(id);
  } catch (error) {
    console.error(`Error updating material with "ID" ${id}:`, error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await materialsCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Material with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting material with ID ${id}:`, error);
    throw error;
  }
};

export const create = async ({ title, quantity, unit, lowStockThreshold }) => {
  const newMaterial = {
    title,
    quantity,
    unit,
    lowStockThreshold,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await materialsCollection.insertOne(newMaterial);
  console.log(`Material with "ID": ${result.insertedId} created successfully.`);

  return newMaterial;
};
