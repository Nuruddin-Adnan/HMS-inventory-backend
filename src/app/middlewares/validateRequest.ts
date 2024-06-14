/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';
import fs from 'fs';

const validateRequest =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      return next();
    } catch (error) {
      if (req.files && Array.isArray(req.files)) {
        // If there are multiple files, delete each one
        req.files.forEach((file: any) => {
          const filePath = file.path;
          fs.unlink(filePath, (err: any) => {
            if (err) {
              next(err);
            }
          });
        });
      }

      if (req.file) {
        const filePath = req.file.path;
        fs.unlink(filePath, (err: any) => {
          if (err) {
            next(err);
          }
        });
      }
      next(error);
    }
  };

export default validateRequest;
