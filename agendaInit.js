const Agenda = require("agenda");
// require("dotenv").config();
//import { initConfig } from "../../config";

//const config = initConfig();
const mongoConnectionString = process.env.MONGO_URL;
console.info(`mongoConnectionString: ${mongoConnectionString}`);
console.info('------------------ Collection used init -----------------------');
console.info(`Collection: ${process.env?.COLLECTION}`);
console.info('------------------ Collection used init -----------------------');
const collection = process.env.COLLECTION;
const processEvery =
  process.env.NODE_ENV == "prod" ? "2 minutes" : "40 seconds";
console.log(processEvery);
const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: collection },
  processEvery: processEvery,
});
// console.log('agenda => ', agenda)

module.exports = {agenda};
