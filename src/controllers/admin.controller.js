import * as adminService from '../services/admin.service.js';
import * as jwtService from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';

export const get = async (req, res) => {
  const { query } = req.query;
  const admins = await adminService.getAll(query);
  res.send(admins);
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const admin = await adminService.getById(id);

  if (!admin) {
    res.sendStatus(404);
    return;
  }

  res.send({ ...admin, id: admin._id });
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
  
  if (!adminService.getById(id)) {
    res.sendStatus(404);
    return;
  }

  await adminService.remove(id);

  res.sendStatus(204);
}

export const register = async (req, res, next) => {
  const { email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  await adminService.create({ email, password: hashPassword });

  const admin = await adminService.findByCredentials(email, password);

  if (!admin) {
    throw ApiError.badRequest('No such user');
  }

  const accessToken = jwtService.sign(admin);

  res.send({ user: { ...admin, id: admin._id }, accessToken });
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await adminService.findByCredentials(email, password);

  if (!admin) {
    throw ApiError.badRequest('No such user');
  }

  const accessToken = jwtService.sign(admin);

  res.send({ admin, accessToken });
}
