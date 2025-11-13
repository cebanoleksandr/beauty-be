import {
  appointmentsCollection,
  servicesCollection,
  scheduleCollection,
  exceptionsCollection
} from '../db.js';
import { ObjectId } from 'mongodb';
import { ApiError } from '../exeptions/api.error.js';

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
      const date = new Date(startTime);
      date.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      filter.startTime = {
        $gte: date,
        $lt: nextDay
      };
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
    console.log(`Fetched appointment by "ID" ${id}:`, appointment ? 'found' : 'not found');

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
    if (clientId !== undefined) updateFields.clientId = new ObjectId(clientId);
    if (masterId !== undefined) updateFields.masterId = new ObjectId(masterId);
    if (startTime !== undefined) updateFields.startTime = new Date(startTime);
    if (serviceId !== undefined) updateFields.serviceId = new ObjectId(serviceId);
    if (status !== undefined) updateFields.status = status;
    if (finalPrice !== undefined) updateFields.finalPrice = finalPrice;
    if (notes !== undefined) updateFields.notes = notes;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for appointment ID: ${id}`);
      return await getById(id);
    }
    
    // TODO: Додати валідацію часу при оновленні (аналогічно до create)

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
    throw ApiError.notFound(`Service with ID ${serviceId} not found.`);
  }

  const newStartTime = new Date(startTime);
  const newEndTime = new Date(newStartTime.getTime() + service.duration_minutes * 60000);
  const masterObjectId = new ObjectId(masterId);

  // === ПОЧАТОК ВАЛІДАЦІЇ ===

  let masterWorkStartTime = null;
  let masterWorkEndTime = null;

  const startOfDay = new Date(newStartTime);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const exception = await exceptionsCollection.findOne({
    masterId: masterObjectId,
    date: startOfDay,
  });

  if (exception) {
    if (exception.isDayOff) {
      throw ApiError.badRequest('У майстра вихідний у цей день (виняток)');
    } else {
      masterWorkStartTime = new Date(startOfDay);
      const [startHour, startMin] = exception.startTime.split(':').map(Number);
      masterWorkStartTime.setUTCHours(startHour, startMin);

      masterWorkEndTime = new Date(startOfDay);
      const [endHour, endMin] = exception.endTime.split(':').map(Number);
      masterWorkEndTime.setUTCHours(endHour, endMin);
    }
  } else {
    const dayOfWeek = newStartTime.getUTCDay();
    
    const schedule = await scheduleCollection.findOne({
      masterId: masterObjectId,
      dayOfWeek: dayOfWeek,
    });

    if (!schedule || !schedule.isAvailable) {
      throw ApiError.badRequest('Майстер не працює в цей день (звичайний графік)');
    }

    masterWorkStartTime = new Date(startOfDay);
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    masterWorkStartTime.setUTCHours(startHour, startMin);

    masterWorkEndTime = new Date(startOfDay);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    masterWorkEndTime.setUTCHours(endHour, endMin);
  }

  if (newStartTime < masterWorkStartTime || newEndTime > masterWorkEndTime) {
    throw ApiError.badRequest(`Час запису виходить за межі робочих годин майстра (${masterWorkStartTime.toUTCString()} - ${masterWorkEndTime.toUTCString()})`);
  }

  const conflict = await appointmentsCollection.findOne({
    masterId: masterObjectId,
    $or: [
      { startTime: { $lt: newEndTime, $gte: newStartTime } },
      { endTime: { $gt: newStartTime, $lte: newEndTime } },
      { startTime: { $lte: newStartTime }, endTime: { $gte: newEndTime } }
    ]
  });

  if (conflict) {
    throw ApiError.badRequest('Цей час вже зайнятий іншим записом');
  }

  // === КІНЕЦЬ ВАЛІДАЦІЇ ===

  const newAppointment = {
    clientId: new ObjectId(clientId),
    masterId: masterObjectId,
    serviceId: new ObjectId(serviceId),
    startTime: newStartTime,
    endTime: newEndTime,
    status: status || 'BOOKED',
    finalPrice: finalPrice || service.price,
    notes: notes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await appointmentsCollection.insertOne(newAppointment);
  console.log(`Appointment with "ID": ${result.insertedId} created successfully.`);

  return { ...newAppointment, _id: result.insertedId };
};
