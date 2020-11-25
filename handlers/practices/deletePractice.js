import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { practice } = data;

  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
    },
  };

  await dynamoDb.delete(params);

  return { status: 200 };
});
