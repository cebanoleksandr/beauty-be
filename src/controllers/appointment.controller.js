import * as appointmentService from '../services/appointment.service.js';

export const get = async (req, res) => {
  const { masterId, clientId, serviceId, status, startTime } = req.query;
  const appointments = await appointmentService.getAll({ masterId, clientId, serviceId, status, startTime });
  res.send(appointments);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const appointment = await appointmentService.getById(id);

  if (!appointment) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...appointment, id: appointment._id });
}

export const update = async (req, res) => {
  const { id } = req.params;
  const {
    clientId,
    masterId,
    serviceId,
    startTime,
    status,
    finalPrice,
    notes
  } = req.body;

  const appointment = await appointmentService.getById(id);

  if (!appointment) {
    res.sendStatus(404);
    return;
  }

  const updatedAppointment = await appointmentService.update({
    id,
    clientId,
    masterId,
    serviceId,
    startTime,
    status,
    finalPrice,
    notes
  });

  res.send(updatedAppointment);
}

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!appointmentService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await appointmentService.remove(id);

  res.sendStatus(204);
};

export const create = async (req, res) => {
  const {
    clientId,
    masterId,
    serviceId,
    startTime,
    status,
    finalPrice,
    notes
  } = req.body;

  const newAppointment = await appointmentService.create({
    clientId,
    masterId,
    serviceId,
    startTime,
    status,
    finalPrice,
    notes
  });

  res.status(201).send(newAppointment);
};
