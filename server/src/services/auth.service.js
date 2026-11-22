// Registration, login and "who am I". Passwords are only ever stored as bcrypt hashes.
import bcrypt from 'bcrypt';
import { ERROR_CODES, MESSAGES, validateLogin, validateRegister } from '@sweety/shared';
import { config } from '../config.js';
import { AppError } from '../lib/AppError.js';
import * as usersRepo from '../repositories/users.repo.js';

// Compared against when the email is unknown, so a login for a missing account takes as long
// as one with a wrong password and the response time does not reveal which emails exist.
const dummyHashPromise = bcrypt.hash('sweety-timing-equaliser', config.bcryptRounds);

function invalidCredentials() {
  return new AppError(401, ERROR_CODES.invalidCredentials, MESSAGES.invalidCredentials);
}

/**
 * Creates a patient account. Public registration can never create a doctor.
 * @param {unknown} input request body
 */
export async function register(input) {
  const { ok, fields, data } = validateRegister(input);
  if (!ok) throw AppError.validation(fields);

  if (await usersRepo.emailExists(data.email)) {
    throw AppError.conflict(ERROR_CODES.emailTaken, MESSAGES.emailTaken, 'email');
  }

  const passwordHash = await bcrypt.hash(data.password, config.bcryptRounds);
  // If two sign-ups race, the unique index rejects the second and the error handler answers 409.
  return usersRepo.createUser({ name: data.name, email: data.email, passwordHash });
}

/**
 * Checks an email and password. Every failure gives the same message on purpose.
 * @param {unknown} input request body
 */
export async function login(input) {
  const { ok, fields, data } = validateLogin(input);
  if (!ok) throw AppError.validation(fields);

  const user = await usersRepo.findUserWithPasswordByEmail(data.email);
  if (!user) {
    await bcrypt.compare(data.password, await dummyHashPromise);
    throw invalidCredentials();
  }

  const matches = await bcrypt.compare(data.password, user.passwordHash);
  if (!matches) throw invalidCredentials();

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

/** The logged-in user, or 401 if the account no longer exists. */
export async function getCurrentUser(userId) {
  const user = await usersRepo.findUserById(userId);
  if (!user) throw AppError.unauthenticated();
  return user;
}
