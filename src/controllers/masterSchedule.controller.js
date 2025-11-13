import * as masterScheduleService from '../services/masterSchedule.service.js';

export const get = async (req, res) => {
  const { query, masterId } = req.query;
  const schedules = await masterScheduleService.getAll({ query, masterId });
  res.send(schedules);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const schedule = await masterScheduleService.getById(id);

  if (!schedule) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...schedule, id: schedule._id });
}

export const update = async (req, res) => {
  const { id } = req.params;
  const {
    dayOfWeek,
    masterId,
    startTime,
    endTime,
    isAvailable
  } = req.body;

  const schedule = await masterScheduleService.getById(id);

  if (!schedule) {
    res.sendStatus(404);
    return;
  }

  const updatedSchedule = await masterScheduleService.update({
    id,
    dayOfWeek,
    masterId,
    startTime,
    endTime,
    isAvailable
  });

  res.send(updatedSchedule);
}

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!masterScheduleService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await masterScheduleService.remove(id);

  res.sendStatus(204);
};

export const create = async (req, res) => {
  const {
    dayOfWeek,
    masterId,
    startTime,
    endTime,
    isAvailable
  } = req.body;

  const newSchedule = await masterScheduleService.create({
    dayOfWeek,
    masterId,
    startTime,
    endTime,
    isAvailable
  });

  res.status(201).send(newSchedule);
};
