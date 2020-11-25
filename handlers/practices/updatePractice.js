import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    practice,
    name,
    phone,
    address,
    address2,
    city,
    state,
    stateName,
    zip,
  } = data;
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
    },
    UpdateExpression:
      "SET #nameAttribute = :name, phone = :phone, address = :address, address2 = :address2, city = :city, #stateAttribte = :state, stateName = :stateName, zip = :zip",
    ExpressionAttributeNames: {
      "#nameAttribute": "name",
      "#stateAttribte": "state",
    },
    ExpressionAttributeValues: {
      ":name": name || null,
      ":phone": phone || null,
      ":address": address || null,
      ":address2": address2 || null,
      ":city": city || null,
      ":state": state || null,
      ":stateName": stateName || null,
      ":zip": zip || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
});
