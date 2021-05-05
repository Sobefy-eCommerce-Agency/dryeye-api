import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const params = {
    TableName: process.env.services_and_treatments_table,
  };
  const response = await dynamoDb.scan(params);

  if (
    event.queryStringParameters?.type &&
    response.Items &&
    response.Items.length > 0
  ) {
    const filteredResponse = response.Items.filter(
      (el) => el.type === event.queryStringParameters.type
    );
    return filteredResponse;
  } else {
    return response.Items;
  }
}, true);
