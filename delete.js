import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { patient, user } = data;

  const params = {
    TableName: process.env.patients_table,
    Key: {
      patient,
      user,
    },
  };

  await dynamoDb.delete(params);

  return { status: 200 };
}, true);
