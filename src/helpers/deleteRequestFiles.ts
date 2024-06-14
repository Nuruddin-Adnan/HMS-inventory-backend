/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import fs from 'fs';

export const deleteRequestFiles = (req: Request) => {
  if (req.files && Array.isArray(req.files)) {
    // If there are multiple files, delete each one
    req.files.forEach((file: any) => {
      const filePath = file.path;
      fs.unlink(filePath, (err: any) => {
        if (err) {
          throw new Error(err);
        }
      });
    });
  }

  if (req.file) {
    const filePath = req.file.path;
    fs.unlink(filePath, (err: any) => {
      if (err) {
        throw new Error(err);
      }
    });
  }
};
