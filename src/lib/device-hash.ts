import { createHash } from 'crypto';

const getSalt = () => {
  const salt = process.env.DEVICE_ID_SALT;
  if (!salt) {
    throw new Error('DEVICE_ID_SALT is not configured');
  }
  return salt;
};

export const hashDeviceId = (deviceId: string) => {
  const salt = getSalt();
  return createHash('sha256').update(`${salt}:${deviceId}`).digest('hex');
};
