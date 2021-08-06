import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.practices_table,
  };
  const practicesResult = await dynamoDb.scan(params);
  const { Items, LastEvaluatedKey } = practicesResult;

  if (Items && Items.length > 0 && LastEvaluatedKey) {
    const newParams = {
      TableName: process.env.practices_table,
      ExclusiveStartKey: LastEvaluatedKey,
    };
    const newResult = await dynamoDb.scan(newParams);
    if (newResult && newResult.Items.length > 0) {
      Items.push(...newResult.Items);
    }
  }

  if (Items.length > 0) {
    for (let i = 0; i < Items.length; i++) {
      const currentPractice = Items[i];
      const { practice, dryEyeProducts, doctor } = currentPractice;

      // Clear products shape
      const shouldCleanProduct = dryEyeProducts.length > 0;
      let newProductValue = shouldCleanProduct ? [] : dryEyeProducts;
      if (shouldCleanProduct && dryEyeProducts.length > 0) {
        dryEyeProducts.forEach((prod) => {
          if (typeof prod !== "number" && prod.id) {
            newProductValue.push(prod.id);
          }
        });
        const updateParams = {
          TableName: process.env.practices_table,
          Key: {
            practice,
            doctor,
          },
          UpdateExpression: "SET dryEyeProducts = :dryEyeProducts",
          ExpressionAttributeValues: {
            ":dryEyeProducts": newProductValue,
          },
          ReturnValues: "ALL_NEW",
        };

        await dynamoDb.update(updateParams);
      }
    }
  }
}, true);
