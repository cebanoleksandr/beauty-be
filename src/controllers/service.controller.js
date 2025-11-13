import * as serviceService from '../services/service.service.js';

export const get = async (req, res) => {
  const { query, masterId } = req.query;
  const services = await serviceService.getAll({ query, masterId });
  res.send(services);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const service = await serviceService.getById(id);

  if (!service) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...service, id: service._id });
}

export const update = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    price,
    duration_minutes,
    masterIds
  } = req.body;

  const service = await serviceService.getById(id);

  if (!service) {
    res.sendStatus(404);
    return;
  }

  const updatedService = await serviceService.update({
    id,
    title,
    price,
    duration_minutes,
    masterIds
  });

  res.send(updatedService);
}

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!serviceService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await serviceService.remove(id);

  res.sendStatus(204);
};

export const create = async (req, res) => {
  const {
    title,
    price,
    duration_minutes,
    masterIds
  } = req.body;

  const newService = await serviceService.create({
    title,
    price,
    duration_minutes,
    masterIds
  });

  res.status(201).send(newService);
};
