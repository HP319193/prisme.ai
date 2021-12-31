import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
