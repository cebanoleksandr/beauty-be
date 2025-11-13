import { exceptionsCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export const getAll = async ({ date, masterId, isDayOff }) => {
  try {
    const filter = {};

    if (date) {
      filter.date = new Date(date);
    }

    if (masterId) {
      filter.masterId = masterId;
    }

    if (isDayOff !== undefined) {
      filter.isDayOff = isDayOff;
    }

    const allScheduleExceptions = await exceptionsCollection.find(filter).toArray();
    console.log('Fetched all schedule exceptions:', allScheduleExceptions.length);

    return allScheduleExceptions;
  } catch (error) {
    console.error("Error fetching all schedule exceptions:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const exception = await exceptionsCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched schedule exception by "ID" ${id}:`, exception ? 'found' : 'not found');

    if (exception) {
      return exception;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching schedule exception by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ date, isDayOff, startTime, endTime, masterId }) => {
  try {
    const updateFields = {};
    if (date !== undefined) updateFields.date = date;
    if (isDayOff !== undefined) updateFields.isDayOff = isDayOff;
    if (startTime !== undefined) updateFields.startTime = startTime;
    if (endTime !== undefined) updateFields.endTime = endTime;
    if (masterId !== undefined) updateFields.masterId = masterId;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for schedule exception ID: ${id}`);
      return await getById(id);
    }

    const result = await exceptionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    console.log(`Schedule exception with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return null;
    }

    return await getById(id);
  } catch (error) {
    console.error(`Error updating schedule exception with "ID" ${id}:`, error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await exceptionsCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Schedule exception with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting schedule exception with ID ${id}:`, error);
    throw error;
  }
};

export const create = async ({ date, isDayOff, startTime, endTime, masterId }) => {
  const newException = {
    date,
    isDayOff,
    startTime,
    endTime,
    masterId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await exceptionsCollection.insertOne(newException);
  console.log(`Schedule exception with "ID": ${result.insertedId} created successfully.`);

  return newException;
};
