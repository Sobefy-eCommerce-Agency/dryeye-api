import AWS from "aws-sdk";
import handler from "../../libs/doctors-handler-lib";

export const main = handler(async (event) => {
  const { practice, doctor } = event.queryStringParameters;
  const params = {
    TableName: process.env.doctors_table,
    ExpressionAttributeNames: {
      "#n": "first_name",
      "#ln": "last_name",
      "#d": "doctor",
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#n,#ln,#d",
    FilterExpression: practice ? "practice = :practice" : "doctor = :doctor",
    ExpressionAttributeValues: { ":practice": practice, ":doctor": doctor },
  };

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const results = await dynamoDb.scan(params).promise();

  // Return the retrieved item
  return results;
});
