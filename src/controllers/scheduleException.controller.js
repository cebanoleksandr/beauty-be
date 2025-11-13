import * as scheduleExceptionService from '../services/scheduleException.service.js';

export const get = async (req, res) => {
  const { query, masterId } = req.query;
  const exceptions = await scheduleExceptionService.getAll({ query, masterId });
  res.send(exceptions);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const exception = await scheduleExceptionService.getById(id);

  if (!exception) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...exception, id: exception._id });
}

export const update = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    price,
    duration_minutes,
    masterIds
  } = req.body;

  const exception = await scheduleExceptionService.getById(id);

  if (!exception) {
    res.sendStatus(404);
    return;
  }

  const updatedException = await scheduleExceptionService.update({
    id,
    title,
    price,
    duration_minutes,
    masterIds
  });

  res.send(updatedException);
}

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!scheduleExceptionService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await scheduleExceptionService.remove(id);

  res.sendStatus(204);
};

export const create = async (req, res) => {
  const {
    title,
    price,
    duration_minutes,
    masterIds
  } = req.body;

  const newException = await scheduleExceptionService.create({
    title,
    price,
    duration_minutes,
    masterIds
  });

  res.status(201).send(newException);
};
