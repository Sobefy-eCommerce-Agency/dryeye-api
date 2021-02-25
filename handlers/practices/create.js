import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    doctor,
    name,
    address,
    address2,
    city,
    state,
    zip,
    phone,
    email,
    website,
    facebook_url,
    instagram_url,
    twitter_url,
    monday_op_hours,
    tuesday_op_hours,
    wednesday_op_hours,
    thursday_op_hours,
    friday_op_hours,
    saturday_op_hours,
    sunday_op_hours,
  } = data;
  const params = {
    TableName: process.env.practices_table,
    Item: {
      doctor,
      name,
      address,
      address2,
      city,
      state,
      zip,
      phone,
      email,
      website,
      facebook_url,
      instagram_url,
      twitter_url,
      monday_op_hours,
      tuesday_op_hours,
      wednesday_op_hours,
      thursday_op_hours,
      friday_op_hours,
      saturday_op_hours,
      sunday_op_hours,
      practice: uuid.v1(),
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(params);
  return { status: 200 };
});
