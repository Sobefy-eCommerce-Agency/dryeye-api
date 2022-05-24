import axios from "axios";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  // Get orders from the DB
  const ordersRequest = {
    TableName: process.env.wholesale_orders_table,
  };
  const ordersResponse = await dynamoDb.scan(ordersRequest);
  const orders = ordersResponse.Items;

  // TODO: Get orders not older than 6 months

  // Get Retail products
  const productsRequest = await axios(
    "https://wholesale.dryeyerescue.com/products.json?limit=250&page=1"
  );
  const retailProducts = productsRequest.data.products;

  const productsPage2Request = await axios(
    "https://wholesale.dryeyerescue.com/products.json?limit=250&page=2"
  );
  const retailProducts2 = productsPage2Request.data.products;
  const products = [...retailProducts, ...retailProducts2];

  // Get all practices
  const allPractices = {
    TableName: process.env.practices_table,
  };
  const practicesResult = await dynamoDb.scan(allPractices);
  const practicesList = practicesResult.Items;

  // Loop trough orders
  if (
    orders &&
    orders.length > 0 &&
    practicesList &&
    practicesList.length > 0 &&
    products &&
    products.length
  ) {
    const ordersToUpdate = [];
    for (const order of orders) {
      const { customer_id, line_item_titles } = order;
      const productTitlesArray = line_item_titles.split(",");
      const matchedProducts = [];

      // Find practice of the order
      const practiceFilter = practicesList.filter(
        (practice) => practice.doctor === customer_id
      );
      const practices =
        practiceFilter && practiceFilter.length > 0 ? practiceFilter : null;

      if (practices) {
        practices.forEach((practice) => {
          const { dryEyeProducts, practice: practiceID } = practice;

          // Calculate Matched products
          productTitlesArray.forEach((productTitle) => {
            const currentProductFilter = products.filter((product) => {
              const {
                title: currentProductTitle,
                tags: currentProductTags,
                id: currentProductID,
              } = product;
              const titleMatches = currentProductTitle === productTitle;
              const hasNoLocatorTag = currentProductTags.includes("No Locator");
              const productAlreadyIncluded =
                dryEyeProducts.filter((prod) => prod === currentProductID)
                  .length > 0;
              const isValid =
                titleMatches && !hasNoLocatorTag && !productAlreadyIncluded;

              return isValid;
            });
            const currentProduct =
              currentProductFilter && currentProductFilter.length === 1
                ? currentProductFilter[0]
                : null;

            if (currentProduct) {
              const { id } = currentProduct;
              matchedProducts.push(id);
            }
          });

          if (matchedProducts && matchedProducts.length > 0) {
            // Add data to main array
            ordersToUpdate.push({
              practice: practiceID,
              products: matchedProducts,
            });
          }
        });
      }
    }

    // Update Practices
    if (ordersToUpdate && ordersToUpdate.length > 0) {
      for (const practice of practicesList) {
        const { practice: currentPracticeID, doctor: currentDoctorID } =
          practice;

        // Filter orders to update
        const currentOrdersToUpdate = ordersToUpdate.filter(
          (order) => order.practice === currentPracticeID
        );

        if (currentOrdersToUpdate && currentOrdersToUpdate.length > 0) {
          const productsToAdd = [];

          for (const orderToUpdate of currentOrdersToUpdate) {
            const { products: productsToUpdate } = orderToUpdate;

            if (productsToUpdate && productsToUpdate.length > 0) {
              productsToAdd.push(...productsToUpdate);
            }
          }

          // Update Practice
          if (productsToAdd && productsToAdd.length > 0) {
            // Get unique products to add
            const uniqueProducts = [
              ...new Set(productsToAdd.map((item) => item)),
            ];

            const updatePracticeParams = {
              TableName: process.env.practices_table,
              Key: {
                practice: currentPracticeID,
                doctor: currentDoctorID,
              },
              UpdateExpression:
                "SET products_from_order = :products_from_order",
              ExpressionAttributeValues: {
                ":products_from_order": uniqueProducts,
              },
              ReturnValues: "ALL_NEW",
            };

            await dynamoDb.update(updatePracticeParams);
          }
        }
      }
    }
  }

  return { orders, products, practicesList };
}, true);
