/* eslint-disable no-inner-declarations */
import cluster from 'cluster';
import { cpus } from 'os'; // to get the number of CPU cores
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config/index';
import { errorlogger, logger } from './shared/logger';

// Check if the current process is a master
if (cluster.isPrimary) {
  const numCPUs = cpus().length;

  logger.info(`Master ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker process exits
  cluster.on('exit', (worker, code, signal) => {
    logger.error(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`,
    );
    // Fork a new worker to replace the dead one
    cluster.fork();
  });
} else {
  // Code inside this block will be executed by worker processes
  let server: Server;

  async function startServer() {
    try {
      await mongoose.connect(config.database_url as string);
      logger.info(`🛢   Database is connected successfully`);

      server = app.listen(config.port, () => {
        logger.info(
          `Worker ${process.pid} is listening on port ${config.port}`,
        );
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason, promise) => {
        errorlogger.error(
          'Unhandled Rejection at:',
          promise,
          'reason:',
          reason,
        );
      });
    } catch (error) {
      errorlogger.error('Failed to start server:', error);
    }
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    errorlogger.error('Uncaught exception occurred:', error);
  });

  // Start the server
  startServer();

  // Handle SIGTERM signal
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received, shutting down gracefully');
    if (server) {
      server.close(() => {
        logger.info('Server closed gracefully');
        process.exit(0); // Exit with success
      });
    }
  });
}
