import app from "./app";
import { env } from "./config/env";
import { sequelize } from "./config/database";
import "./models";

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    console.log("MySQL database connection established");

    await sequelize.sync();
console.log("All database tables created successfully");

    app.listen(env.port, () => {
      console.log(
        `Server running on http://localhost:${env.port}`,
      );
    });
  } catch (error) {
    console.error("Unable to start server:", error);

    process.exit(1);
  }
};

void startServer();