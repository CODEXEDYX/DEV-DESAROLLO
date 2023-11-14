import mongoose from "mongoose";

const connectDB = async (_) => {
  try {
    //let baseDatos = `${process.env.MONGO_URI}`;

    let kuberentesDocker = "mongodb://mongo-service:27017/miapp";

    const db = await mongoose.connect(kuberentesDocker, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${db.connection.host}:${db.connection.port}`;

    console.log(`mongo conectado en ${url}`);
  } catch (error) {
    console.log(`ERROR ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
