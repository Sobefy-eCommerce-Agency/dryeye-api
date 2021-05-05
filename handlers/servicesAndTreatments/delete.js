import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { id } = data;
  const params = {
    TableName: process.env.services_and_treatments_table,
    Key: {
      id,
    },
  };

  await dynamoDb.delete(params);

  return { status: 200 };
}, true);
