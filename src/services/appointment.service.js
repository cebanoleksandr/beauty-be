import { appointmentsCollection, servicesCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export const getAll = async ({ masterId, clientId, serviceId, status, startTime }) => {
  try {
    const filter = {};

    if (masterId) {
      filter.masterId = new ObjectId(masterId);
    }

    if (clientId) {
      filter.clientId = new ObjectId(clientId);
    }

    if (serviceId) {
      filter.serviceId = new ObjectId(serviceId);
    }

    if (status) {
      filter.status = status;
    }

    if (startTime) {
      filter.startTime = startTime;
    }

    const allAppointments = await appointmentsCollection.find(filter).toArray();
    console.log('Fetched all appointments:', allAppointments.length);

    return allAppointments;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const appointment = await appointmentsCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched appointment by "ID" ${id}:`, service ? 'found' : 'not found');

    if (appointment) {
      return appointment;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching appointment by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ id, clientId, masterId, serviceId, startTime, status, finalPrice, notes }) => {
  try {
    const updateFields = {};
    if (clientId !== undefined) updateFields.clientId = clientId;
    if (masterId !== undefined) updateFields.masterId = masterId;
    if (startTime !== undefined) updateFields.startTime = startTime;
    if (serviceId !== undefined) updateFields.serviceId = serviceId;
    if (status !== undefined) updateFields.status = status;
    if (finalPrice !== undefined) updateFields.finalPrice = finalPrice;
    if (notes !== undefined) updateFields.notes = notes;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for appointment ID: ${id}`);
      return await getById(id);
    }

    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    console.log(`Appointment with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

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
    const result = await appointmentsCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Appointment with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting appointment with ID ${id}:`, error);
    throw error;
  }
};

export const create = async ({ clientId, masterId, serviceId, startTime, status, finalPrice, notes }) => {
  const service = await servicesCollection.findOne({ _id: new ObjectId(serviceId) });

  if (!service) {
    throw new Error(`Service with ID ${serviceId} not found.`);
  }

  const newAppointment = {
    clientId,
    masterId,
    serviceId,
    startTime,
    endTime: new Date(new Date(startTime).getTime() + service.duration_minutes * 60000),
    status,
    finalPrice,
    notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await appointmentsCollection.insertOne(newAppointment);
  console.log(`Appointment with "ID": ${result.insertedId} created successfully.`);

  return newAppointment;
};
