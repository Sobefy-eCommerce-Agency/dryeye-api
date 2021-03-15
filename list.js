import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event) => {
  let response = [];
  if (event.queryStringParameters?.user) {
    const params = {
      TableName: process.env.patients_table,
      KeyConditionExpression: "#userAttribute = :user",
      ExpressionAttributeNames: {
        "#userAttribute": "user",
      },
      ExpressionAttributeValues: {
        ":user": event.queryStringParameters.user,
      },
    };
    response = await dynamoDb.query(params);
  } else {
    const params = {
      TableName: process.env.patients_table,
    };
    response = await dynamoDb.scan(params);
  }

  // Return the matching list of items in response body
  return response.Items;
}, true);
