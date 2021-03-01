import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { firstName, lastName, practice, customer } = data;

  // Check if the customer has practices
  const doctorParams = {
    TableName: process.env.doctors_table,
    Key: {
      doctor: customer,
    },
  };
  const currentDoctor = await dynamoDb.get(doctorParams);
  if (currentDoctor.Item) {
    const params = {
      TableName: process.env.my_doctors_table,
      Item: {
        firstName,
        lastName,
        practice,
        owner: customer,
        doctor: uuid.v1(),
        createdAt: Date.now(),
      },
    };
    await dynamoDb.put(params);
    return { status: 200 };
  }
  throw new Error("An unexpected error happened");
});
