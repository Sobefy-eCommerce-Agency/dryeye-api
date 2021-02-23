import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { practice, name, address, address2, city, state, zip, phone } = data;
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
    },
    UpdateExpression:
      "SET name = :name, address = :address, address2 = :address2, city = :city, state = :state, zip = :zip, phone = :phone",
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
