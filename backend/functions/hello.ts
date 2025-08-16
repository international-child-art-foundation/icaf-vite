export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Apocryphal" }),
    headers: { "Content-Type": "application/json" }
  };
};
