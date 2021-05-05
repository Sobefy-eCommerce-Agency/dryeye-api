import * as uuid from "uuid";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const { label, type } = data;

  // Check if theres a element with the same label
  const servicesAndTreatmentsParams = {
    TableName: process.env.services_and_treatments_table,
  };
  const elements = await dynamoDb.scan(servicesAndTreatmentsParams);
  if (elements && elements.Items && elements.Items.length > 0) {
    const filteredElements = elements.Items.filter(
      (el) => el.label === label && el.type === type
    );
    if (filteredElements.length > 0) {
      throw new Error(`A ${type} with the same label already exists.`);
    }
  }

  // Create the element
  const params = {
    TableName: process.env.services_and_treatments_table,
    Item: {
      label,
      type,
      id: uuid.v1(),
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(params);
  return { status: 200 };
}, true);
