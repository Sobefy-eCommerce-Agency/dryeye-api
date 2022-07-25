import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

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
      const { practice, doctor } = currentPractice;

      const updateParams = {
        TableName: process.env.practices_table,
        Key: {
          practice,
          doctor,
        },
        UpdateExpression: "SET phone_tracking_number = :phone_tracking_number",
        ExpressionAttributeValues: {
          ":phone_tracking_number": "",
        },
        ReturnValues: "ALL_NEW",
      };

      await dynamoDb.update(updateParams);
    }
  }

  return { status: 200 };
}, true);
