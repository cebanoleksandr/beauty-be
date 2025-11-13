import { sheduleCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export const getAll = async ({ dayOfWeek, masterId, isAvailable }) => {
  try {
    const filter = {};

    if (dayOfWeek) {
      filter.dayOfWeek = dayOfWeek;
    }

    if (masterId) {
      filter.masterId = masterId;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable;
    }

    const schedule = await sheduleCollection.find(filter).toArray();
    console.log('Fetched all schedule:', schedule.length);

    return schedule;
  } catch (error) {
    console.error("Error fetching all schedule:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const schedule = await sheduleCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched schedule by "ID" ${id}:`, schedule ? 'found' : 'not found');

    if (schedule) {
      return schedule;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching schedule by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ dayOfWeek, masterId, startTime, endTime, isAvailable }) => {
  try {
    const updateFields = {};
    if (dayOfWeek !== undefined) updateFields.dayOfWeek = dayOfWeek;
    if (masterId !== undefined) updateFields.masterId = masterId;
    if (startTime !== undefined) updateFields.startTime = startTime;
    if (endTime !== undefined) updateFields.endTime = endTime;
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for schedule ID: ${id}`);
      return await getById(id);
    }

    const result = await sheduleCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    console.log(`Schedule with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return null;
    }

    return await getById(id);
  } catch (error) {
    console.error(`Error updating schedule with "ID" ${id}:`, error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await sheduleCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Schedule with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting schedule with ID ${id}:`, error);
    throw error;
  }
};

export const create = async ({ dayOfWeek, masterId, startTime, endTime, isAvailable }) => {
  const newSchedule = {
    dayOfWeek,
    masterId,
    startTime,
    endTime,
    isAvailable,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await sheduleCollection.insertOne(newSchedule);
  console.log(`Schedule with "ID": ${result.insertedId} created successfully.`);

  return newSchedule;
};
