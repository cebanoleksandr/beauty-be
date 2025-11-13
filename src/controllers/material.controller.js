import * as materialService from '../services/material.service.js';

export const get = async (req, res) => {
  const { query } = req.query;
  const materials = await materialService.getAll({ query });
  res.send(materials);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const material = await materialService.getById(id);

  if (!material) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...material, id: material._id });
}

export const update = async (req, res) => {
  const { id } = req.params;
  const { title, quantity, unit, lowStockThreshold } = req.body;

  const material = await materialService.getById(id);

  if (!material) {
    res.sendStatus(404);
    return;
  }

  const updatedMaterial = await materialService.update({
    id,
    title,
    quantity,
    unit,
    lowStockThreshold
  });

  res.send(updatedMaterial);
}

export const remove = async (req, res) => {
  const { id } = req.params;

  if (!materialService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await materialService.remove(id);

  res.sendStatus(204);
};

export const create = async (req, res) => {
  const { title, quantity, unit, lowStockThreshold } = req.body;
  const newService = await materialService.create({ title, quantity, unit, lowStockThreshold});
  res.status(201).send(newService);
};
