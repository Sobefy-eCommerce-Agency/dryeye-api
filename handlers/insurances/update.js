import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { id, label } = data;

  const params = {
    TableName: process.env.insurances_table,
    Key: {
      id,
    },
    UpdateExpression: "SET label = :label, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":label": label || null,
      ":updatedAt": Date.now(),
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
