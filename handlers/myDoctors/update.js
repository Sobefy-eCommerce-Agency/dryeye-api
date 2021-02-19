import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    doctor,
    customer,
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
    TableName: process.env.my_doctors_table,
    Key: {
      doctor,
      owner: customer,
    },
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
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
});
