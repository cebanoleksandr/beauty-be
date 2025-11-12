import { adminsCollection } from '../db.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export const getAll = async (query) => {
  try {
    const filter = {};

    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }
    const allAdmins = await adminsCollection.find(filter).toArray();
    console.log('Fetched all admins:', allAdmins.length);

    return allAdmins.map(({ password, ...adminWithoutPassword }) => adminWithoutPassword);
  } catch (error) {
    console.error("Error fetching all admins:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const admin = await adminsCollection.findOne({ _id: new ObjectId(id) });
    console.log(`Fetched admin by "ID" ${id}:`, admin ? 'found' : 'not found');

    if (admin) {
      const { password, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching admin by "ID" ${id}:`, error);
    throw error;
  }
};

export const update = async ({ 
  id, 
  firstName,
  lastName,
  photoUrl,
  coverPhotoUrl,
  specializations,
  contacts
}) => {
  try {
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (photoUrl !== undefined) updateFields.photoUrl = photoUrl;
    if (coverPhotoUrl !== undefined) updateFields.coverPhotoUrl = coverPhotoUrl;
    if (specializations !== undefined) updateFields.specializations = specializations;
    if (contacts !== undefined) updateFields.contacts = contacts;

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 1 && updateFields.hasOwnProperty('updatedAt')) {
      console.log(`No specific fields to update for admin ID: ${id}`);
      return await getById(id);
    }

    const result = await adminsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    
    console.log(`Admin with "ID" ${id} updated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return null;
    }

    return await getById(id);
  } catch (error) {
    console.error(`Error updating admin with "ID" ${id}:`, error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    const result = await adminsCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Admin with "ID" ${id} deleted. Deleted Count: ${result.deletedCount}`);

    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting admin with ID ${id}:`, error);
    throw error;
  }
};

export const findByCredentials = async (email, plainTextPassword) => {
  try {
    const admin = await adminsCollection.findOne({ email });
    if (!admin) {
      return null;
    }

    const isMatch = await bcrypt.compare(plainTextPassword, admin.password);
    if (isMatch) {
      const { password, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } else {
      throw ApiError.badRequest('Wrong password');
    }
  } catch (error) {
    console.error("Error finding admin by credentials:", error);
    throw error;
  }
};

export const create = async ({ email, password }) => {
  const existAdmin = await findByCredentials(email, password);

  if (existAdmin) {
    throw ApiError.badRequest('Admin already exist', { email: 'Admin already exist' });
  }

  const newAdmin = {
    email,
    password,
    firstName: null,
    lastName: null,
    photoUrl: null,
    coverPhotoUrl: null,
    specializations: [],
    contacts: {
      instagram: null,
      phone: null,
      telegram: null,
      facebook: null,
    },
    updatedAt: new Date(),
    createdAt: new Date(),
  }

  const result = await adminsCollection.insertOne(newAdmin);

  console.log(`Admin with "id": ${result.insertedId} created successfully.`);

  return newAdmin;
}
