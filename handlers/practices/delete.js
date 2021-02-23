import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { practice } = data;
  // Remove the practice of the doctors
  const updateDoctorsParams = {
    TableName: process.env.my_doctors_table,
    KeyConditionExpression: "practice = :currentPractice",
    UpdateExpression: "SET practice = :practice",
    ExpressionAttributeValues: {
      ":currentPractice": practice,
      ":practice": "",
    },
    ReturnValues: "ALL_NEW",
  };
  await dynamoDb.update(updateDoctorsParams);

  // Remove the practice
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
    },
  };

  await dynamoDb.delete(params);

  return { status: 200 };
});
