import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { id, label, type } = data;

  const params = {
    TableName: process.env.services_and_treatments_table,
    Key: {
      id,
    },
    UpdateExpression: "SET label = :label, #typeAttribute = :type",
    ExpressionAttributeNames: {
      "#typeAttribute": "type",
    },
    ExpressionAttributeValues: {
      ":label": label || null,
      ":type": type || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
