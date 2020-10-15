import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const { term, user } = event.queryStringParameters;
  const params = {
    TableName: process.env.patientsTable,
    KeyConditionExpression: "#userAttribute = :user",
    FilterExpression: "begins_with(firstName, :term)",
    ExpressionAttributeNames: {
      "#userAttribute": "user",
    },
    ExpressionAttributeValues: {
      ":user": user,
      ":term": term,
    },
  };

  const result = await dynamoDb.query(params);

  // Return the matching list of items in response body
  return result.Items;
});
