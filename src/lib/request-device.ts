import type { NextRequest } from 'next/server';
import { hashDeviceId } from './device-hash';

export class DeviceHeaderError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const getDeviceIdFromRequest = (request: NextRequest) => {
  const deviceId = request.headers.get('x-device-id');
  if (!deviceId) {
    throw new DeviceHeaderError('Device header is missing', 400);
  }
  return deviceId;
};

export const getDeviceHashFromRequest = (request: NextRequest) => {
  const deviceId = getDeviceIdFromRequest(request);
  return hashDeviceId(deviceId);
};
