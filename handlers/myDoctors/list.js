import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { customer, owner } = event.queryStringParameters;

  const params = {
    TableName: process.env.my_doctors_table,
  };

  const myDoctors = await dynamoDb.scan(params);

  const filteredDoctors = [];
  if (myDoctors.Items) {
    for (let i = 0; i < myDoctors.Items.length; i++) {
      const currentDoctor = myDoctors.Items[i];
      if (currentDoctor.owner === customer) {
        filteredDoctors.push(currentDoctor);
      }
    }
    if (owner === "true") {
      const params = {
        TableName: process.env.doctors_table,
        Key: {
          doctor: customer,
        },
      };
      const currentOwner = await dynamoDb.get(params);
      if (currentOwner.Item) {
        // add the owner as a doctor
        filteredDoctors.push({
          firstName: currentOwner.Item.first_name,
          lastName: currentOwner.Item.last_name,
          doctor: currentOwner.Item.doctor,
        });
      }
    }
  }

  return filteredDoctors;
}, true);
