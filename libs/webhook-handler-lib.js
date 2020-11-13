export default function handler(lambda) {
  return async function (event, context) {
    let statusCode;
    try {
      // Run the Lambda
      await lambda(event, context);
      statusCode = 200;
    } catch (e) {
      // Print out the full error
      console.log(e);
    }
    // Return HTTP response
    return {
      statusCode,
    };
  };
}
