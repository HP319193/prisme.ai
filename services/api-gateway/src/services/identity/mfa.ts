import { authenticator } from 'otplib';
import { OTPKey } from '.';
import { Logger } from '../../logger';
import { PrismeContext } from '../../middlewares';
import { StorageDriver } from '../../storage';
import {
  AuthenticationError,
  NotFoundError,
  RequestValidationError,
} from '../../types/errors';
import { buildQRCode } from './utils';

export const setupUserMFA =
  (OTPKeys: StorageDriver<OTPKey>, ctx?: PrismeContext, logger?: Logger) =>
  async (
    user: Prismeai.User,
    mfa: PrismeaiAPI.SetupMFA.RequestBody
  ): Promise<PrismeaiAPI.SetupMFA.Responses.$200> => {
    if (mfa.method === 'totp') {
      return await setupOTP(OTPKeys, ctx, logger)(user, mfa);
    }

    // On MFA disabling, clean OTP
    if (user.mfa === 'totp') {
      try {
        await OTPKeys.delete({ userId: user.id! });
      } catch {}
    }
    return {
      method: '',
    };
  };

export interface OTPValidation {
  secret: string;
  qrImage: string;
}
export const setupOTP =
  (OTPKeys: StorageDriver<OTPKey>, ctx?: PrismeContext, logger?: Logger) =>
  async (
    user: Prismeai.User,
    mfa: PrismeaiAPI.SetupMFA.RequestBody
  ): Promise<OTPValidation> => {
    const { step: period } = authenticator.allOptions();
    const secret = authenticator.generateSecret(20);
    const otpURL = authenticator.keyuri(user.email!, 'Prisme.ai', secret);

    const otpKey: OTPKey = {
      userId: user.id!,
      method: mfa.method,
      period,
      secret,
    };
    await OTPKeys.save(otpKey, {
      upsertQuery: {
        userId: user.id!,
      },
    });
    return {
      qrImage: buildQRCode(otpURL),
      secret,
    };
  };

export const validateMFA =
  (OTPKeys: StorageDriver<OTPKey>) =>
  async (user: Prismeai.User, credentials: PrismeaiAPI.MFA.RequestBody) => {
    if (!user.mfa || user.mfa == 'none') {
      throw new NotFoundError('No MFA configured');
    }

    if (user.mfa === 'totp') {
      const otpKey = (await OTPKeys.find({ userId: user.id }))[0];
      if (!otpKey) {
        throw new NotFoundError('No MFA configured');
      }
      if (!credentials.totp) {
        throw new RequestValidationError('Missing totp field');
      }
      const isValid = authenticator.check(credentials.totp, otpKey.secret);
      if (!isValid) {
        throw new AuthenticationError('Bad TOTP');
      }
    }
  };
