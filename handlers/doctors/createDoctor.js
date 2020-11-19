import * as uuid from "uuid";
import handler from "../../libs/doctors-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    email,
    phone,
    first_name,
    last_name,
    practice_name,
    verified_customer,
  } = data;
  const params = {
    TableName: process.env.doctors_table,
    Item: {
      email,
      phone,
      first_name,
      last_name,
      verified_customer,
      note: practice_name,
      doctor: uuid.v1(),
      created_at: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return { status: 200 };
});
