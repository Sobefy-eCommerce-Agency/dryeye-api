import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const allPracticesParams = {
    TableName: process.env.doctors_table,
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#t,#a",
    FilterExpression: "attribute_exists(#a)",
    ExpressionAttributeNames: {
      "#t": "tags",
      "#a": "addresses",
    },
  };

  const practices = await dynamoDb.scan(allPracticesParams);

  // Filter empty addresses
  const filteredPractices = [];

  if (practices.Items) {
    for (let i = 0; i < practices.Items.length; i++) {
      const practice = practices.Items[i];
      const addresses = practice.addresses;
      if (addresses !== "" && addresses !== null && addresses.length > 0) {
        for (let j = 0; j < addresses.length; j++) {
          const address = practice.addresses[j];
          if (address.company) {
            // check if the practice has the doctor or staff tag
            const tags = practice.tags;
            if (tags) {
              const tagsArray = tags.split(",");
              if (tagsArray && tagsArray.length > 0) {
                let validDoctorOrStaff = false;
                for (let i = 0; i < tagsArray.length; i++) {
                  const currentTag = tagsArray[i];
                  const trimmedTag = currentTag.trim();
                  // check if the tag includes the Doctor tag
                  if (
                    trimmedTag === "Type of Account|Doctor" ||
                    trimmedTag === "Type of Account|Staff"
                  ) {
                    validDoctorOrStaff = true;
                  }
                }
                if (validDoctorOrStaff) {
                  filteredPractices.push(address);
                }
              }
            }
          }
        }
      }
    }
  }

  return filteredPractices;
}, true);
