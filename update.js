import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    address2,
    city,
    state,
    zip,
    patient,
    user,
  } = data;
  const params = {
    TableName: process.env.patients_table,
    Key: {
      patient,
      user,
    },
    UpdateExpression:
      "SET firstName = :firstName, lastName = :lastName, email = :email, phone = :phone, address = :address, address2 = :address2, city = :city, #stateAttribte = :state, zip = :zip",
    ExpressionAttributeNames: {
      "#stateAttribte": "state",
    },
    ExpressionAttributeValues: {
      ":firstName": firstName || null,
      ":lastName": lastName || null,
      ":email": email || null,
      ":phone": phone || null,
      ":address": address || null,
      ":address2": address2 || null,
      ":city": city || null,
      ":state": state || null,
      ":zip": zip || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
