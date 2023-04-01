import crypto from 'crypto';

//функция шифрования пароля 
export const generateMD5 = (value: string): string => {
  return crypto.createHash('md5').update(value).digest('hex');
};