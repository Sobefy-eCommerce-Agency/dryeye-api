import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const { customer } = event.queryStringParameters;

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
    // check if the customer is owner
    const params = {
      TableName: process.env.doctors_table,
      Key: {
        doctor: customer,
      },
    };
    const currentOwner = await dynamoDb.get(params);
    if (currentOwner.Item) {
      // check tags
      const tags = currentOwner.Item.tags;
      if (tags) {
        const tagsArray = tags.split(",");
        if (tagsArray && tagsArray.length > 0) {
          for (let i = 0; i < tagsArray.length; i++) {
            const currentTag = tagsArray[i];
            const trimmedTag = currentTag.trim();
            // check if the tag includes the Doctor tag
            if (trimmedTag === "Type of Account|Doctor") {
              // add the current doctor as a owner
              filteredDoctors.push({
                firstName: currentOwner.Item.first_name,
                lastName: currentOwner.Item.last_name,
                doctor: currentOwner.Item.doctor,
              });
            }
          }
        }
      }
    }
  }

  return filteredDoctors;
}, true);
