import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const { patient, user } = event.queryStringParameters;
  const {
    firstName,
    lastName,
    email,
    phone,
    birthdate,
    address,
    address2,
    city,
    state,
    zip,
  } = data;
  const params = {
    TableName: process.env.patients_table,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      patient,
      user,
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression:
      "SET firstName = :firstName, lastName = :lastName, email = :email, phone = :phone, birthdate = :birthdate, address = :address, address2 = :address2, city = :city, #stateAttribte = :state, zip = :zip",
    ExpressionAttributeNames: {
      "#stateAttribte": "state",
    },
    ExpressionAttributeValues: {
      ":firstName": firstName || null,
      ":lastName": lastName || null,
      ":email": email || null,
      ":phone": phone || null,
      ":birthdate": birthdate || null,
      ":address": address || null,
      ":address2": address2 || null,
      ":city": city || null,
      ":state": state || null,
      ":zip": zip || null,
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
});
