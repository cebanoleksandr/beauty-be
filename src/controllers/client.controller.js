import * as clientService from '../services/client.service.js';
import * as jwtService from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';

export const get = async (req, res) => {
  const { query } = req.query;
  const clients = await clientService.getAll(query);
  res.send(clients);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const client = await clientService.getById(id);

  if (!client) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...client, id: client._id });
}

export const update = async (req, res) => {
  const { id } = req.params;
  const { 
    firstName,
    lastName,
    photoUrl,
    coverPhotoUrl,
    specializations,
    contacts
  } = req.body;

  const admin = await adminService.getById(id);

  if (!admin) {
    res.sendStatus(404);
    return;
  }

  const updatedAdmin = await adminService.update({
    id,
    firstName,
    lastName,
    photoUrl,
    coverPhotoUrl,
    specializations,
    contacts
  });

  res.send(updatedAdmin);
}

export const remove = async (req, res) => {
  const { id } = req.params;
  
  if (!clientService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await clientService.remove(id);

  res.sendStatus(204);
}

export const register = async (req, res, next) => {
  const { email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  await clientService.create({ email, password: hashPassword });

  const client = await clientService.findByCredentials(email, password);

  if (!client) {
    throw ApiError.badRequest('No such user');
  }

  const accessToken = jwtService.sign(client);

  res.send({ client: { ...client, id: client._id }, accessToken });
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  const client = await clientService.findByCredentials(email, password);

  if (!client) {
    throw ApiError.badRequest('No such client');
  }

  const accessToken = jwtService.sign(client);

  res.send({ client: { ...client, id: client._id }, accessToken });
}
