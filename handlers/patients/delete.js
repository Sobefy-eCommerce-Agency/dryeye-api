import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { patientID } = data;
  const params = {
    TableName: process.env.patients_by_practice_table,
    Key: {
      patientID,
    },
  };

  await dynamoDb.delete(params);

  return { status: 200 };
}, true);
