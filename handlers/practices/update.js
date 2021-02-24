import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    practice,
    doctor,
    name,
    address,
    address2,
    city,
    state,
    zip,
    phone,
  } = data;
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
      doctor,
    },
    UpdateExpression:
      "SET #nameAttr = :name, address = :address, address2 = :address2, city = :city, #stateAttr = :state, zip = :zip, phone = :phone",
    ExpressionAttributeNames: {
      "#nameAttr": "name",
      "#stateAttr": "state",
    },
    ExpressionAttributeValues: {
      ":name": name || null,
      ":address": address || null,
      ":address2": address2 || null,
      ":city": city || null,
      ":state": state || null,
      ":zip": zip || null,
      ":phone": phone || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
});
