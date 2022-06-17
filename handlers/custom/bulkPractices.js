import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
import { FormatURL } from "../../utils/utils";

export const main = handler(async () => {
  const params = {
    TableName: process.env.practices_table,
  };
  let practicesResult = await dynamoDb.scan(params);
  if (
    practicesResult &&
    practicesResult.Items.length > 0 &&
    practicesResult.LastEvaluatedKey
  ) {
    const lastEvaluatedKey = practicesResult.LastEvaluatedKey;
    const newParams = {
      TableName: process.env.practices_table,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    const newResult = await dynamoDb.scan(newParams);
    if (newResult && newResult.Items.length > 0) {
      practicesResult.Items.push(...newResult.Items);
    }
  }

  if (practicesResult && practicesResult.Items.length > 0) {
    for (let i = 0; i < practicesResult.Items.length; i++) {
      const currentPractice = practicesResult.Items[i];
      const { practice, doctor, website } = currentPractice;

      const formattedWebsite = FormatURL(website);

      const updateParams = {
        TableName: process.env.practices_table,
        Key: {
          practice,
          doctor,
        },
        UpdateExpression: "SET website = :website",
        ExpressionAttributeValues: {
          ":website": formattedWebsite,
        },
        ReturnValues: "ALL_NEW",
      };

      await dynamoDb.update(updateParams);
    }
  }

  return { status: 200 };
}, true);
